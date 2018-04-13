import { ipcMain } from 'electron'
import web3 from '../web3Mannager'
import db from '../dbManager'
import log from '../log'

const SEND_TRANSACTION = 'send-transaction'
const SEND_TRANSACTION_REPLY = 'send-transaction-reply'

class TransactionChannel {
  bind (mainWindow) {
    ipcMain.on(SEND_TRANSACTION, (event, obj) => {
      log.info('send transaction: ', obj)
      let tx = obj.tx
      web3.eth.personal
        .unlockAccount(tx.from, obj.password)
        .then(result => {
          web3.eth
            .sendTransaction(tx)
            .once('transactionHash', function (hash) {
              log.info('transactionHash: ', hash)
              let transaction = {
                hash,
                timestamp: Date.now()
              }
              log.debug('typeof tx.from: ', typeof tx.from, ' - ', tx.from)

              Object.assign(transaction, tx)
              db.transactions.insert(transaction)
              let reply = { transactionHash: hash, transaction }
              mainWindow.webContents.send(SEND_TRANSACTION_REPLY, reply)
            })
            .once('confirmation', function (confNumber, receipt) {
              log.info(
                '==============================>>> confirmation: confNumber=',
                confNumber,
                ', receipt: ',
                receipt
              )
              let transaction = db.transactions.by('hash', receipt.transactionHash)
              if (transaction != null) {
                transaction.receipt = receipt
                db.transactions.update(transaction)
                mainWindow.webContents.send(SEND_TRANSACTION_REPLY, receipt)
              } else {
                log.error('transaction not found in db: ', receipt.transactionHash)
              }
            })
            .on('error', error => log.info(error))
        })
        .catch(error => {
          log.error(error)
          let reply = { error: 'invalid-password' }
          event.sender.send(SEND_TRANSACTION_REPLY, reply)
        })
    })
  }
}

const transaction = new TransactionChannel()

export default transaction
