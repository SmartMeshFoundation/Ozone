class ObserveAccounts {
  start () {
    this.web3 = global.web3

    this.timer = setInterval(() => {
      this._getAccounts()
    }, 1000)
  }

  _getAccounts () {
    this.web3.eth.getAccounts()
      .then(accounts => {
        global.accounts = accounts
      })
  }

  stop () {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}

export default new ObserveAccounts()
