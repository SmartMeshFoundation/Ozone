import { EventEmitter } from 'events'
import _ from 'lodash'
import { Types } from '../ipc/types'
import logger from '../logger'

const log = logger.create('NodeState')
const debug = _.bind(log.debug, log)

class NodeState extends EventEmitter {
  constructor () {
    super()
    this.on('sync', this._sync)
  }

  _sync () {
    let web3 = global.web3
    let state = {}
    Promise.all([
      web3.eth.getBlockNumber(),
      web3.eth.net.getPeerCount(),
      web3.eth.getGasPrice()
    ])
      .then(([blockNumber, peers, gasPrice]) => {
        state = {
          blockNumber,
          peers,
          gasPrice
        }
        if (state.blockNumber === 0) {
          return web3.eth.isSyncing()
        }
        debug('Current node state: ', state)
        global.windows.broadcast(Types.NODE_STATE_CHANGE, state)
      })
      .then(syncing => {
        if (typeof syncing === 'object') {
          state.blockNumber = syncing.currentBlock
        }
        global.windows.broadcast(Types.NODE_STATE_CHANGE, state)
      })
      .catch(err => {
        log.error('Try to update node state occur error.', err)
      })
  }
}

export default new NodeState()
