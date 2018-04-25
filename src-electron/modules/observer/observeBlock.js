import _ from 'lodash'
import logger from '../logger'
import { Types } from '../ipc/types'

const log = logger.create('ObserveBlock')

class ObserveBlock {
  constructor () {
    this.subscription = null
  }

  start () {
    this.web3 = global.web3

    this.subscription = this.web3.eth
      .subscribe('newBlockHeaders')
      .on('data', blockHeader => {
        // log.debug('Emitted newBlockHeaders: ', blockHeader)
        let { number } = blockHeader
        if (number != null) {
          this._syncAccount()
          this._syncTransaction()
          this._updateNodeState()
        }
      })
  }

  // update the node status
  _updateNodeState () {
    let blockNumber, peers
    this.web3.eth.getBlock('latest')
      .then(block => {
        if (block != null) {
          blockNumber = block.number
          return this.web3.eth.net.getPeerCount()
        } else {
          throw new Error('Can not found "latest" block.')
        }
      })
      .then(count => {
        peers = count
        global.windows.broadcast(Types.NODE_STATE_CHANGE, { blockNumber, peers })
      })
      .catch(err => {
        log.error('Try to update node state occur error.', err)
      })
  }

  _syncAccount (blockHeader) {
    global.stateManager.emit('sync', 'account')
  }

  _syncTransaction (blockHeader) {
    this.web3.eth.getBlock('latest').then(block => {
      if (block.transactions.length > 0) {
        block.transactions.forEach(txHash => {
          this._saveTx(txHash)
        })
      }
    })
  }

  _saveTx (txHash) {
    let transactions = global.db.transactions
    let t
    this.web3.eth
      .getTransaction(txHash)
      .then(tx => {
        t = tx
        return this.web3.eth.getTransactionReceipt(txHash)
      })
      .then(receipt => {
        if (receipt != null) {
          t.receipt = receipt
        }
        return this.web3.eth.getBlock(receipt.blockNumber)
      })
      .then(block => {
        let item = transactions.by('_id', txHash)
        if (item != null) {
          transactions.update(_.assign(item, t, { timestamp: block.timestamp }))
        } else {
          transactions.insert(
            _.assign({ _id: txHash }, t, { timestamp: block.timestamp })
          )
        }
        global.stateManager.emit('sync', 'transaction')
      })
      .catch(err => {
        log.error('Get transaction occur error.', err)
      })
  }

  stop () {
    // unsubscribes the subscription
    if (this.subscription != null) {
      this.subscription.unsubscribe(function (error, success) {
        if (success) {
          log.info('Successfully unsubscribed!')
        } else {
          log.error('Failed to unsubscribe "newBlockHeaders": ', error)
        }
      })
    }
  }
}

export default new ObserveBlock()
