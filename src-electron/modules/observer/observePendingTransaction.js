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
    this.transactions = global.db.transactions

    this.subscription = this.web3.eth
      .subscribe('pendingTransactions')
      .on('data', txHash => {
        log.info('Incoming pending transactionHash: ', txHash)
        this.web3.eth.getTransaction(txHash)
          .then(tx => {
            if (tx) {
              log.debug('Incoming pending transaction: ', tx)
              let transaction = {
                _id: txHash,
                confirmed: false,
                confirmCount: 0,
                timestamp: moment().unix()
              }

              tx = _.assign(transaction, tx)
              this.transactions.insert(tx)

              global.stateManager.emit('sync', 'transaction')
            }
          })
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
