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
  }
}

export default new IpcCommunicator()
