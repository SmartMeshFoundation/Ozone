import logger from '../logger'
import { Types } from '../ipc/types'

const log = logger.create('TransactionState')

class TransactionState {
  sync (manager) {
    this._windows = manager
    this._sync()
  }

  _sync () {
    log.info('load transactions from db')
    const db = global.db
    let transactions = db.transactions
      .chain()
      .simplesort('timestamp', true)
      .data()
    this._windows.broadcast(Types.SYNC_TRANSACTION, { transactions })
  }
}

const transaction = new TransactionState()

export default transaction
