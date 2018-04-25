import _ from 'lodash'
import logger from '../logger'

const log = logger.create('ObserveTransaction')

class ObserveTransaction {
  updateTransactions (blockHeader) {
    this.transactions = global.db.transactions
    this.web3 = global.web3

    if (blockHeader.number) {
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

  _updateTransaction (txHash) {
    // TODO update transaction state
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
        let item = this.transactions.by('_id', txHash)
        if (item != null) {
          this.transactions.update(_.assign(item, t, { timestamp: block.timestamp }))
        } else {
          this.transactions.insert(
            _.assign({ _id: txHash }, t, { timestamp: block.timestamp })
          )
        }
        global.stateManager.emit('sync', 'transaction')
      })
      .catch(err => {
        log.error('Get transaction occur error.', err)
      })
  }
}

export default new ObserveTransaction()
