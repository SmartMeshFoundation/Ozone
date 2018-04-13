import _ from 'lodash'
import stores from './store'
import log from './log'

/**
 * Initial vue store state
 */
class StoreManager {
  constructor (mainWindow) {
    if (_.isUndefined(mainWindow)) {
      throw new Error('No pass the "mainWindow" parameter')
    }
    this._window = mainWindow
  }

  restore (name) {
    if (!_.isUndefined(name)) {
      // log.debug('restore state ==> ', name)
      if (stores[name]) {
        stores[name].restore(this._window)
      } else {
        log.debug('Could not restore! state name: ', name, ' not found!')
      }
    } else {
      log.info('restore all state...')
      for (let key in stores) {
        stores[key].restore(this._window)
      }
    }
  }
}

export default StoreManager
