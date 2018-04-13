import web3 from '../web3Mannager'
import db from '../dbManager'
import BigNumber from 'bignumber.js'
import { Types } from '../channel/types'

class AccountStore {
  constructor () {
    this._window = null
  }

  restore (mainWindow) {
    this._window = mainWindow
    this._restoreAccounts()
  }

  _getAccountName (address, index) {
    let account = db.accounts.findOne({ address })
    if (account == null) {
      return 'Account ' + index
    } else {
      return account.name
    }
  }

  _toEther (balance) {
    let eth = web3.utils.fromWei(balance, 'ether')
    return new BigNumber(eth).toFixed(2)
  }

  _restoreAccounts () {
    web3.eth
      .getAccounts()
      .then(addresses => {
        return Promise.all(
          addresses.map((address, index) => {
            return new Promise((resolve, reject) => {
              web3.eth
                .getBalance(address)
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
        // log.debug('Find accounts: \n', accounts)
        this._window.webContents.send(Types.RESTORE_ACCOUNT, { accounts })
      })
  }
}

const account = new AccountStore()

export default account
