import logger from '../logger'
import observeTransaction from '../observer/observeTransaction'
import _ from 'lodash'

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
          syncAccount()
          syncNodeState()
          observeTransaction.updateTransactions(blockHeader)
        }
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

// update the node status to front end
const syncNodeState = _.debounce(() => {
  global.stateManager.emit('sync', 'node')
}, 1000)

// update the account to front end
const syncAccount = _.debounce(() => {
  global.stateManager.emit('sync', 'account')
}, 1000)

export default new ObserveBlock()
