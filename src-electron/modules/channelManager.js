import { ipcMain } from 'electron'
import StoreManager from './storeManager'
import observeManager from './observeManager'
import logger from './logger'
import channels from './ipc'
import { Types } from './ipc/types'

class ChannelManager {
  constructor () {
    this._log = logger.create('ChannelManager')
  }

  bind (mainWindow) {
    let store = new StoreManager(mainWindow)

    // client ready
    ipcMain.on(Types.CLIENT_READY, () => {
      this._log.info(Types.CLIENT_READY, ' event fired.')
      observeManager.start(store)
    })

    // restore vue-store
    ipcMain.on(Types.RESTORE_STATE, (event, stateName) => {
      this._log.info(Types.RESTORE_STATE, ' event fired.')
      store.restore(stateName)
    })

    channels.forEach(channel => {
      channel.bind(mainWindow)
    })
  }
}

const channel = new ChannelManager()

export default channel
