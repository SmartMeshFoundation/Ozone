import Web3 from 'web3'
import _ from 'lodash'

const url = 'ws://localhost:9656'

class Web3Manager {
  init () {
    this._count = 0

    let promise = new Promise((resolve, reject) => {
      this._resolve = resolve
      this._reject = reject
    })

    this.connect()

    return promise
  }

  async connect () {
    if (this._count++ < 3) {
      let status = await this.reconnect()
      if (status) {
        this._resolve(status)
      } else {
        setTimeout(_.bind(this.connect, this), 1000)
      }
    } else {
      this._reject(new Error('Can not connected to node by: ' + url))
    }
  }

  async reconnect () {
    this.web3 = new Web3(url)
    let status = await this.web3.eth.isListening()
    return status
  }
}

export default new Web3Manager()
