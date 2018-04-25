import _ from 'lodash'
import logger from '../logger'

const log = logger.create('ObserveTransaction')

class ObserveTransaction {
  updateTransactions (blockHeader) {
    this.transactions = global.db.transactions
    this.web3 = global.web3

    if (blockHeader.number) {
      // find out not confirmed transactions from db
      let results = this.transactions.find({confirmed: false})
      if (results.length > 0) {
        results.forEach(tx => {
          this._checkConfirmation(tx, blockHeader)
        })
      }

      this.web3.eth.getBlock(blockHeader.number)
        .then(block => {
          if (block.transactions.length > 0) {
            block.transactions.forEach(txHash => {
              this._updateTransaction(txHash, block)
            })
          }
        })
    }
  }

  _checkConfirmation (tx, blockHeader) {
    // TODO check confirmation of transaction
  }

  _updateTransaction (txHash, block) {
    let transaction
    this.web3.eth
      .getTransaction(txHash)
      .then(tx => {
        transaction = tx
        return this.web3.eth.getTransactionReceipt(txHash)
      })
      .then(receipt => {
        if (receipt != null) {
          transaction.receipt = receipt
        }

        let tx = this.transactions.by('_id', txHash)
        if (tx != null) {
          this.transactions.update(_.assign(tx, transaction))
        } else {
          this._saveTransaction(transaction, block)
        }
        syncTransaction()
      })
      .catch(err => {
        log.error('Get transaction occur error.', err)
      })
  }

  // If the transaction's 'from' or 'to' property
  // is wallet address, then save tx to db.
  _saveTransaction (tx, block) {
    this.web3.eth.getAccounts()
      .then(accounts => {
        return accounts.filter(account => account === tx.from || account === tx.to)
      })
      .then(owners => {
        if (owners && owners.length > 0) {
          let transaction = {
            _id: tx.hash,
            confirmed: false,
            confirmations: 0,
            timestamp: block.timestamp
          }
          this.transactions.insert(_.assign(transaction, tx))
          syncTransaction()
        }
      })
  }
}

// flush transaction list of UI
const syncTransaction = _.debounce(() => {
  global.stateManager.emit('sync', 'transaction')
}, 1000)

export default new ObserveTransaction()
