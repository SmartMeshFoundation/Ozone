import { ipcMain as ipc } from 'electron'
import { EventEmitter } from 'events'
import _ from 'lodash'
import logger from '../logger'
import { Types } from '../ipc/types'

const log = logger.create('TransactionState')

class TransactionState extends EventEmitter {
  constructor () {
    super()
    this.on('sync', this._sync)

    ipc.on(Types.SEND_TRANSACTION, _.bind(this._sendTransaction, this))
  }

  _sync () {
    log.info('load transactions from db')
    const db = global.db
    let transactions = db.transactions
      .chain()
      .simplesort('timestamp', true)
      .data()
    global.windows.broadcast(Types.SYNC_TRANSACTION, { transactions })
  }

  _sendTransaction (event, obj) {
    const web3 = global.web3
    const db = global.db
    log.info('send transaction: ', _.pick(obj, ['from', 'to', 'value']))
    let tx = obj.tx
    // let _this = this
    web3.eth.personal
      .unlockAccount(tx.from, obj.password)
      .then(result => {
        web3.eth
          .sendTransaction(tx)
          .once('transactionHash', (hash) => {
            log.info('transactionHash: ', hash)
            tx = {
              _id: hash,
              timestamp: Date.now()
            }

            tx = _.assign(tx, obj.tx)
            db.transactions.insert(tx)
            let reply = { transactionHash: hash, tx }
            event.sender.send(Types.SEND_TRANSACTION_REPLY, reply)
            this._sync()
          })
          .once('confirmation', (confNumber, receipt) => {
            log.debug(
              '==>> confirmation: confNumber=',
              confNumber,
              ', receipt: ',
              receipt
            )

            tx = db.transactions.by('_id', receipt.transactionHash)

            if (tx != null) {
              tx.receipt = receipt
              db.transactions.update(tx)
              this._sync()
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
  }
}

export default new TransactionState()
