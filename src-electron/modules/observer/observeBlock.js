import logger from '../logger'
import { Types } from '../ipc/types'
import observeTransaction from '../observer/observeTransaction'

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
        // log.debug('Incoming new block's header: ', blockHeader)
        if (blockHeader.number) {
          this._syncAccount()
          this._updateNodeState()
          observeTransaction.updateTransactions(blockHeader)
        }
      })
  }

  // update the node status
  _updateNodeState () {
    let blockNumber, peers
    this.web3.eth
      .getBlock('latest')
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
        global.windows.broadcast(Types.NODE_STATE_CHANGE, {
          blockNumber,
          peers
        })
      })
      .catch(err => {
        log.error('Try to update node state occur error.', err)
      })
  }

  _syncAccount (blockHeader) {
    global.stateManager.emit('sync', 'account')
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
