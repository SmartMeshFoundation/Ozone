import { ipcMain as ipc } from 'electron'
import _ from 'lodash'
import logger from '../logger'
import { Types } from './types'

const log = logger.create('TransactionChannel')

const db = global.db
const web3 = global.web3

class TransactionChannel {
  init (winManager) {
    ipc.on(Types.SEND_TRANSACTION, (event, obj) => {
      log.info('send transaction: ', obj)
      let tx = obj.tx
      web3.eth.personal
        .unlockAccount(tx.from, obj.password)
        .then(result => {
          web3.eth
            .sendTransaction(tx)
            .once('transactionHash', function (hash) {
              log.info('transactionHash: ', hash)
              tx = {
                _id: hash,
                timestamp: Date.now()
              }

              tx = _.assign(transaction, obj.tx)
              db.transactions.insert(tx)
              let reply = { transactionHash: hash, tx }
              event.sender.send(Types.SEND_TRANSACTION_REPLY, reply)
            })
            .once('confirmation', function (confNumber, receipt) {
              log.debug(
                '==>> confirmation: confNumber=',
                confNumber,
                ', receipt: ',
                receipt
              )

              tx = db.transactions.by('_id', receipt.transactionHash)

              if (tx != null) {
                tx.receipt = receipt
                db.transactions.update(transaction)

                let transactions = db.transactions
                  .chain()
                  .simplesort('timestamp', true)
                  .data()

                event.sender.send(Types.RESTORE_TRANSACTION, {
                  transactions
                })
              } else {
                log.error(
                  'transaction not found in db: ',
                  receipt.transactionHash
                )
              }
            })
            .on('error', log.error)
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
