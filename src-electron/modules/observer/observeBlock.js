import logger from '../logger'
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
    global.stateManager.emit('sync', 'node')
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
