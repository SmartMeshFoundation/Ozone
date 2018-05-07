import _ from 'lodash'
import logger from '../logger'
import Settings from '../settings'

const log = logger.create('ObserveTransaction')

class ObserveTransaction {
  /**
   * Call this method when incoming new block.
   */
  updateTransactions (blockHeader) {
    this.transactions = global.db.transactions
    this.web3 = global.web3

    if (blockHeader.number) {
      // find out waitting confirmed transactions from db
      let results = this.transactions.find({ confirmed: false })
      if (results.length > 0) {
        Promise.all(
          results.map(tx => {
            return this._checkConfirmations(tx, blockHeader)
          })
        )
          .then(() => {
            syncTransaction()
          })
          .finally(() => {
            this._checkOwnedTransactions(blockHeader.number)
          })
      } else {
        this._checkOwnedTransactions(blockHeader.number)
      }
    }
  }

  /**
   *
   * @param {object} tx Transaction of local db
   * @param {object} blockHeader Incoming new block header
   */
  _checkConfirmations (tx, blockHeader) {
    let _resolve
    let promise = new Promise((resolve, reject) => {
      _resolve = resolve
    })

    log.debug('Check confirmations tx in db, current blockNumber = ', blockHeader.number, '\n',
      _.pick(tx, ['hash', 'blockNumber', 'confirmCount', 'confirmed']))

    // If the transaction mined, blockNumber is not null
    if (tx.blockNumber && !tx.confirmed) {
      let transaction
      this.web3.eth
        .getTransaction(tx.hash)
        .then(t => {
          transaction = t
          return this.web3.eth.getTransactionReceipt(tx.hash)
        })
        .then(receipt => {
          if (transaction && receipt) {
            tx.confirmCount = blockHeader.number - tx.blockNumber
            log.debug('Check confirmations tx update confirmCount to ', tx.confirmCount)
            if (tx.confirmCount >= Settings.requiredConfirmations) {
              log.debug('The tx set to confirmed = true')
              tx.confirmed = true
            }
            this.transactions.update(tx)
          }
          _resolve()
        })
        .catch(err => {
          log.error('Get transaction occur error.', err)
        })
    } else {
      _resolve()
    }
    return promise
  }

  _checkOwnedTransactions (blockNumber) {
    this.web3.eth
      .getBlock(blockNumber)
      .then(block => {
        if (block.transactions.length > 0) {
          block.transactions.forEach(txHash => {
            this._updateOwnedTransaction(txHash, block)
          })
        }
      })
      .catch(err => {
        log.error('Get block occur error.', err)
      })
  }

  _updateOwnedTransaction (txHash, block) {
    let transaction
    this.web3.eth
      .getTransaction(txHash)
      .then(t => {
        transaction = t
        return this.web3.eth.getTransactionReceipt(txHash)
      })
      .then(receipt => {
        if (!transaction && !receipt) return

        transaction.receipt = receipt

        let tx = this.transactions.by('_id', txHash)
        if (tx != null) {
          log.debug('Update owned transaction on db: \n', _.pick(tx, ['hash', 'blockNumber', 'timestamp']))
          log.debug('Update owned transaction on chain: \n', _.pick(transaction, ['hash', 'blockNumber']))
          log.debug('Block timestamp: ', block.timestamp)
          tx.timestamp = block.timestamp

          this.transactions.update(_.assign(tx, transaction))
        } else {
          this._insertOwnedTransaction(transaction, block)
        }
        syncTransaction()
      })
      .catch(err => {
        log.error('Get transaction occur error.', err)
      })
  }

  // If the transaction's 'from' or 'to' property
  // is wallet address, then save tx to db.
  _insertOwnedTransaction (tx, block) {
    this.web3.eth
      .getAccounts()
      .then(accounts => {
        return accounts.filter(
          account => account === tx.from || account === tx.to
        )
      })
      .then(owners => {
        if (owners && owners.length > 0) {
          let transaction = {
            _id: tx.hash,
            confirmed: false,
            confirmCount: 0,
            timestamp: block.timestamp
          }
          this.transactions.insert(_.assign(transaction, tx))
          log.debug('Insert owned transaction to db: \n', transaction)
          syncTransaction()
        }
      })
      .catch(err => {
        log.error('Get accounts occur error.', err)
      })
  }
}

// flush transaction list of UI
const syncTransaction = _.debounce(() => {
  global.stateManager.emit('sync', 'transaction')
}, 2000)

export default new ObserveTransaction()
