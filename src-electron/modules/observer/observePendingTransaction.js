import _ from 'lodash'
import moment from 'moment'
import logger from '../logger'

const log = logger.create('ObservePendingTransaction')

class ObservePendingTransaction {
  constructor () {
    this.subscription = null
  }

  start () {
    this.web3 = global.web3
    this.db = global.db

    this.subscription = this.web3.eth
      .subscribe('pendingTransactions')
      .on('data', transaction => {
        log.info('Incoming pending transaction: ', transaction)

        let tx = {
          _id: transaction.hash,
          confirmed: false,
          confirmations: 0,
          timestamp: moment.unix()
        }

        tx = _.assign(tx, transaction)
        this.db.transaction.insert(tx)

        global.stateManager.emit('sync', 'transaction')
      })
  }

  stop () {
    // unsubscribes the subscription
    if (this.subscription != null) {
      this.subscription.unsubscribe(function (error, success) {
        if (success) {
          log.info('Successfully unsubscribed!')
        } else {
          log.error('Failed to unsubscribe "pendingTransactions".', error)
        }
      })
    }
  }
}

export default new ObservePendingTransaction()
