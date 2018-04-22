import _ from 'lodash'
import { EventEmitter } from 'events'
import states from './states'
import logger from './logger'

const log = logger.create('StateManager')

/**
 * Initial vue store state
 */
class StateManager extends EventEmitter {
  constructor () {
    super()
    this.on('sync', this._sync)
  }

  _sync (name) {
    if (!_.isUndefined(name)) {
      // log.debug('restore state ==> ', name)
      if (states[name]) {
        states[name].emit('sync')
      } else {
        log.debug('Could not sync state! state name: ', name, ' not found!')
      }
    } else {
      log.info('Sync all state to UI...')
      for (let key in states) {
        states[key].emit('sync')
      }
    }
  }
}

export default new StateManager()
