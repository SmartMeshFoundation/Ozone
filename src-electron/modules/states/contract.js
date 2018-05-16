import { ipcMain as ipc } from 'electron'
import { EventEmitter } from 'events'
import _ from 'lodash'
import moment from 'moment'
import BigNumber from 'bignumber.js'
import { Types } from '../ipc/types'
import logger from '../logger'

const log = logger.create('ContractState')
const debug = _.bind(log.debug, log)

class ContractState extends EventEmitter {
  constructor () {
    super()
    this.on('sync', this._sync)

    ipc.on(Types.DEPLOY_CONTRACT, (event, data) => {
      debug('ipc call: ', Types.DEPLOY_CONTRACT)
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

    debug('deploy options: ', options)

    let myContract = new web3.eth.Contract(abi)
    let tx = myContract.deploy(options)

    tx.estimateGas()
      .then(gas => {
        debug('Estimate gas: ', gas)

        let opts = {
          from: data.from,
          gas
        }

        if (data.value && this._checkValue(data.value)) {
          let value = new BigNumber(data.value).toFixed()
          opts = _.extend(opts, { value: web3.utils.toWei(value) })
        }
        debug('contract tx send options: ', opts)

        tx.send(opts)
          .on('error', error => {
            log.warn('Failed to deploy.', error)
            global.windows.broadcast(Types.DEPLOY_CONTRACT_REPLY, { error: error.message })
          })
          .on('transactionHash', (txHash) => {
            debug('tx hash: ', txHash)

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
            debug('tx receipt: ', receipt)
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

  _checkValue (value) {
    if (!value) {
      return false
    }
    let n = Number(value)

    return !Number.isNaN(n) && n > 0
  }
}

export default new ContractState()
