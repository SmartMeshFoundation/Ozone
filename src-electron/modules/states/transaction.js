import { ipcMain as ipc } from 'electron'
import { EventEmitter } from 'events'
import moment from 'moment'
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
    log.info(
      'ipc call send transaction: \n',
      _.pick(obj.tx, ['from', 'to', 'value', 'data'])
    )
    let tx = obj.tx
    // let _this = this
    web3.eth.personal
      .unlockAccount(tx.from, obj.password)
      .then(result => {
        return web3.eth
          .sendTransaction(tx)
          .once('transactionHash', hash => {
            let reply = { transactionHash: hash, tx }
            event.sender.send(Types.SEND_TRANSACTION_REPLY, reply)
          })
          .on('error', error => {
            throw error
          })
      })
      .catch(error => {
        log.error(error)
        let reply = { error: 'invalid-password' }
        event.sender.send(Types.SEND_TRANSACTION_REPLY, reply)
      })
      .finally(() => {
        web3.eth.personal.lockAccount(tx.from)
      })
  }
}

export default new TransactionState()
