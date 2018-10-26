import {
  ipcMain as ipc,
  app
} from 'electron'
import {
  Types
} from './types'

import logger from '../logger'
import spectrumNode from '../spectrumNode'
import settings from '../settings'

import rimraf from 'rimraf'
import fs from 'fs'
import path from 'path'

const log = logger.create('IpcCommunicator')

class IpcCommunicator {
  bind () {
    ipc.on(Types.MENU_ACTION_RMDATA_CONFIRM, (event) => {
      log.debug('Will clean chain data...')
      spectrumNode.stop().then(() => {
        fs.unlinkSync(path.join(settings.chainDataDir, '../', 'transactions.rlp'))
        rimraf(settings.chainDataDir, (err) => {
          if (err) {
            log.error('remove chain data encounter an error:', err)
          } else {
            log.info('remove chain data success')
            if (process.env.DEV) {
              app.exit()
            } else {
              app.relaunch()
              app.exit()
            }
          }
        })
      })
    })
    ipc.on(Types.MENU_ACTION_CHANGE_NETWORK_CONFIRM, (event, net) => {
      log.debug('Will change network...')
      settings.network = net
      global.menu.create()
      if (process.env.DEV) {
        setTimeout(() => {
          app.quit()
        }, 3000)
      } else {
        setTimeout(() => {
          app.relaunch()
          app.quit()
        }, 3000)
      }
    })
    ipc.on(Types.MENU_ACTION_CHANGE_NETWORK_CANCEL, (event) => {
      global.menu.create()
    })
    ipc.on(Types.HIDE_MENU, (event) => {
      global.menu.create(true)
    })
    ipc.on(Types.SHOW_MENU, (event) => {
      global.menu.create()
    })
  }
}

export default new IpcCommunicator()
