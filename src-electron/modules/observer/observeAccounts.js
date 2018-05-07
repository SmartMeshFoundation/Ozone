import logger from '../logger'

const log = logger.create('ObserveAccounts')

class ObserveAccounts {
  start () {
    log.info('starting ...')
    this.web3 = global.web3

    this.timer = setInterval(() => {
      this._getAccounts()
    }, 3000)
  }

  _getAccounts () {
    this.web3.eth.getAccounts()
      .then(accounts => {
        // log.debug('getAccounts: ', accounts)
        global.accounts = accounts
      })
  }

  stop () {
    if (this.timer) {
      clearInterval(this.timer)
    }
    log.info('stopped.')
  }
}

export default new ObserveAccounts()
