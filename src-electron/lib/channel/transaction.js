import { ipcMain } from 'electron'
import web3 from '../web3Mannager'
import db from '../dbManager'
import log from '../log'

import { Types } from './types'

class TransactionChannel {
  bind (mainWindow) {
    ipcMain.on(Types.SEND_TRANSACTION, (event, obj) => {
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
              mainWindow.webContents.send(Types.SEND_TRANSACTION_REPLY, reply)
            })
            .once('confirmation', function (confNumber, receipt) {
              log.debug(
                '==>> confirmation: confNumber=',
                confNumber,
                ', receipt: ',
                receipt
              )

              let transaction = db.transactions.by(
                'hash',
                receipt.transactionHash
              )

              if (transaction != null) {
                transaction.receipt = receipt
                db.transactions.update(transaction)

                let transactions = db.transactions
                  .chain()
                  .simplesort('timestamp', true)
                  .data()

                mainWindow.webContents.send(Types.RESTORE_TRANSACTION, {
                  transactions
                })
              } else {
                log.error(
                  'transaction not found in db: ',
                  receipt.transactionHash
                )
              }
            })
            .on('error', error => log.info(error))
        })
        .catch(error => {
          log.error(error)
          let reply = { error: 'invalid-password' }
          event.sender.send(Types.SEND_TRANSACTION_REPLY, reply)
        })
    })
  }
}

const transaction = new TransactionChannel()

export default transaction
