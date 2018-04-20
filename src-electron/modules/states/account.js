import BigNumber from 'bignumber.js'
import { Types } from '../ipc/types'

class AccountState {
  constructor () {
    this._windows = null
  }

  sync (manager) {
    this._windows = manager
    this._syncAccunts()
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
    return new BigNumber(eth).toFixed(2)
  }

  _syncAccunts () {
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
        this._windows.broadcast(Types.SYNC_ACCOUNT, { accounts })
      })
  }
}

const account = new AccountState()

export default account
