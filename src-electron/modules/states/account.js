import { ipcMain as ipc } from 'electron'
import BigNumber from 'bignumber.js'
import { EventEmitter } from 'events'
import { Types } from '../ipc/types'
import logger from '../logger'

const log = logger.create('AccountState')

class AccountState extends EventEmitter {
  constructor () {
    super()
    this.on('sync', this._sync)

    ipc.on(Types.SYNC_ACCOUNT, () => {
      log.debug('ipc call: ', Types.SYNC_ACCOUNT)
      this._sync()
    })
  }

  _getAccountName (address, index) {
    let db = global.db
    let account = db.accounts.by('_id', address)
    if (account == null) {
      return 'Account ' + index
    } else {
      return account.name
    }
  }

  _toEther (balance) {
    let web3 = global.web3
    let eth = web3.utils.fromWei(balance, 'ether')
    return new BigNumber(eth).toFixed(3, 1)
  }

  _sync () {
    let web3 = global.web3
    web3.eth.getAccounts()
      .then(addresses => {
        return Promise.all(
          addresses.map((address, index) => {
            return new Promise((resolve, reject) => {
              web3.eth.getBalance(address)
                .then(balance => {
                  resolve({
                    name: this._getAccountName(address, index),
                    address,
                    balance,
                    ether: this._toEther(balance)
                  })
                })
                .catch(error => reject(error))
            })
          })
        )
      })
      .then(accounts => {
        global.windows.broadcast(Types.SYNC_ACCOUNT, { accounts })
      })
  }
}

export default new AccountState()
