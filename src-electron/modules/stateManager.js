import _ from 'lodash'
import { EventEmitter } from 'events'
import states from './states'
import logger from './logger'

const log = logger.create('StateManager')

/**
 * Initial vue store state
 */
class StateManager extends EventEmitter {
  init (manager) {
    if (_.isUndefined(manager)) {
      throw new Error('Not pass the windows manager argument')
    }
    this._windows = manager

    this.on('sync', this._sync)
  }

  _sync (name) {
    if (!_.isUndefined(name)) {
      // log.debug('restore state ==> ', name)
      if (states[name]) {
        states[name].sync(this._windows)
      } else {
        log.debug('Could not sync state! state name: ', name, ' not found!')
      }
    } else {
      log.info('Sync all state to UI...')
      for (let key in states) {
        states[key].sync(this._windows)
      }
    }
  }
}

export default new StateManager()
