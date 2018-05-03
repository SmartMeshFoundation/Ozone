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
      .subscribe('pendingTransactions', (error, result) => {
        if (!error) log.info(result)
      })
      .on('data', tx => {
        if (tx) {
          log.info('Incoming pending transactionHash: ', _.pick(tx, ['hash', 'blockNumber']))
          this._checkOwnedTransaction(tx)
        }
      })
  }

  _checkOwnedTransaction (tx) {
    this.web3.eth.getAccounts()
      .then(accounts => {
        if (accounts && accounts.length > 0) {
          let owned = accounts.filter(address => {
            address = address.toLowerCase()
            return address === tx.from || address === tx.to
          })
          if (owned && owned.length > 0) {
            let transaction = {
              _id: tx.hash,
              confirmed: false,
              confirmCount: 0,
              timestamp: moment().unix()
            }

            transaction = _.assign(transaction, tx)
            this.transactions.insert(transaction)

            syncTransaction()
          }
        }
      })
      .catch(err => {
        log.error(err)
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

// notify UI changed
const syncTransaction = _.debounce(() => {
  global.stateManager.emit('sync', 'transaction')
}, 1000)

export default new ObservePendingTransaction()
