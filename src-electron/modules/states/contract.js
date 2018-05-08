import {
  ipcMain as ipc
} from 'electron'

import BigNumber from 'bignumber.js'

import {
  EventEmitter
} from 'events'

import {
  Types
} from '../ipc/types'

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
    // TODO
  }
}

export default new ContractState()
