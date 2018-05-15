import { ipcMain as ipc } from 'electron'
import { EventEmitter } from 'events'
import _ from 'lodash'
import moment from 'moment'
import { Types } from '../ipc/types'
import logger from '../logger'

const log = logger.create('ContractState')

class ContractState extends EventEmitter {
  constructor () {
    super()
    this.on('sync', this._sync)

    ipc.on(Types.DEPLOY_CONTRACT, (event, data) => {
      log.debug('ipc call: ', Types.DEPLOY_CONTRACT)
      this._deploy(data)
    })
  }

  _sync () {
    // TODO
  }

  /**
   * Deploy the contract to chain
   * @param {Object} data contract meta data
   */
  _deploy (data) {
    let web3 = global.web3
    let db = global.db
    let abi = JSON.parse(data.abi)

    let options = { data: data.bytecode }
    if (this._getConstructor(abi)) {
      options.arguments = this._parseArguments(abi, data.args)
    }

    log.debug('deploy options: ', options)

    let myContract = new web3.eth.Contract(abi)
    let tx = myContract.deploy(options)

    tx.estimateGas()
      .then(gas => {
        log.debug('Estimate gas: ', gas)

        tx.send({
          from: data.from,
          gas
        })
          .on('error', error => {
            log.warn('Failed to deploy.', error)
            global.windows.broadcast(Types.DEPLOY_CONTRACT_REPLY, { error: error.message })
          })
          .on('transactionHash', (txHash) => {
            log.debug('tx hash: ', txHash)
            let contract = {
              _id: txHash,
              name: '',
              confirmed: false,
              contractAddress: '',
              timestamp: moment().unix()
            }
            db.contracts.insert(contract)
            global.windows.broadcast(Types.DEPLOY_CONTRACT_REPLY, { txHash })
          })
          .on('receipt', (receipt) => {
            log.debug('tx receipt: ', receipt)
            let contract = db.contracts.by('_id', receipt.transactionHash)
            contract.confirmed = true
            contract.contractAddress = receipt.contractAddress
            db.contracts.update(contract)
          })
      })
      .catch(error => {
        log.warn('Failed to deploy. ', error.message)
        global.windows.broadcast(Types.DEPLOY_CONTRACT_REPLY, { error: error.message })
      })
  }

  _getConstructor (abi) {
    return abi.find(f => f.type === 'constructor')
  }

  _parseArguments (abi, args) {
    args = args.split(',').map(e => e.trim())
    let cons = this._getConstructor(abi)
    return cons.inputs.map((input, idx) => {
      if (input.type.indexOf('uint') > -1) {
        let num = Number.parseInt(args[idx])
        return Number.isNaN(num) ? 0 : num
      } else {
        let arg = args[idx]
        return _.isUndefined(arg) ? '' : arg
      }
    })
  }
}

export default new ContractState()