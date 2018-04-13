import { ipcMain } from 'electron'
import StoreManager from './storeManager'
import observeManager from './observeManager'
import log from './log'
import channels from './channel'

const RESTORE_STATE = 'restore-state'
const CLIENT_READY = 'client-ready'

class ChannelManager {
  bind (mainWindow) {
    let store = new StoreManager(mainWindow)

    // client ready
    ipcMain.on(CLIENT_READY, () => {
      log.info(CLIENT_READY, ' event fired.')
      observeManager.start(store)
    })

    // restore vue-store
    ipcMain.on(RESTORE_STATE, (event, stateName) => {
      log.info(RESTORE_STATE, ' event fired.')
      store.restore(stateName)
    })

    channels.forEach(channel => {
      channel.bind(mainWindow)
    })
  }
}

const channel = new ChannelManager()

export default channel
