import db from '../dbManager'
import log from '../log'

class TransactionStore {
  restore (mainWindow) {
    this._window = mainWindow
    this._restore()
  }

  _restore () {
    log.info('load transactions from db')
    let transactions = db.transactions.chain().simplesort('timestamp', true).data()
    this._window.webContents.send('restore-transaction', { transactions })
  }
}

const transaction = new TransactionStore()

export default transaction
