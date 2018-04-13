import { ipcMain } from 'electron'
import StoreManager from './storeManager'
import observeManager from './observeManager'
import log from './log'
import channels from './channel'
import { Types } from './channel/types'

class ChannelManager {
  bind (mainWindow) {
    let store = new StoreManager(mainWindow)

    // client ready
    ipcMain.on(Types.CLIENT_READY, () => {
      log.info(Types.CLIENT_READY, ' event fired.')
      observeManager.start(store)
    })

    // restore vue-store
    ipcMain.on(Types.RESTORE_STATE, (event, stateName) => {
      log.info(Types.RESTORE_STATE, ' event fired.')
      store.restore(stateName)
    })

    channels.forEach(channel => {
      channel.bind(mainWindow)
    })
  }
}

const channel = new ChannelManager()

export default channel
