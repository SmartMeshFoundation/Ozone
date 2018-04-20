'use strict'

import { app, dialog, BrowserWindow, ipcMain as ipc } from 'electron'
import path from 'path'
import Q from 'bluebird'
import Web3 from 'web3'
import Settings from '../modules/settings'
import db from '../modules/db'
import logger from '../modules/logger'
import clientBinaryManager from '../modules/clientBinaryManager'
import spectrumNode from '../modules/spectrumNode'
import nodeSync from '../modules/nodeSync'
import Windows from '../modules/windows'
import { Types } from '../modules/ipc/types'
import StateManager from '../modules/stateManager'

const log = logger.create('Main')

log.info(`Running in production mode: ${Settings.inProductionMode}`)
// log.debug('\n================= process.env ================= \n', process.env)
// log.debug('userDataPath = ', Settings.userDataPath)
// log.debug('userHomePath = ', Settings.userHomePath)
// log.debug('appDataPath = ', Settings.appDataPath)

if (process.env.PROD) {
  global.__statics = path.join(__dirname, 'statics').replace(/\\/g, '\\\\')
} else {
  global.__statics = __statics
}

global.icon = path.join(global.__statics, 'icon_smart.png')

global.db = db
global.web3 = new Web3()

// prevent crashed and close gracefully
process.on('uncaughtException', error => {
  log.error('UNCAUGHT EXCEPTION', error)
  app.quit()
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit()
})

let killedSocketsAndNodes = false

app.on('before-quit', event => {
  if (!killedSocketsAndNodes) {
    log.info('Defer quitting until sockets and node are shut down')

    event.preventDefault()

    // delay quit, so the sockets can close
    setTimeout(async () => {
      // await spectrumNode.stop()

      killedSocketsAndNodes = true
      await db.close()

      app.quit()
    }, 500)
  } else {
    log.info('About to quit...')
  }
})

app.on('ready', () => {
  // initialise the db
  global.db.init()
    .then(onReady)
    .catch(err => {
      log.error(err)
      app.quit()
    })
})

let mainWin = null

function onReady () {
  mainWin = Windows.create('main', {
    primary: true,
    electronOptions: {
      show: false,
      title: Settings.appDescription,
      width: 1000,
      height: 600,
      backgroundColor: '#2e2c29',
      useContentSize: true,
      webPreferences: {
        preload: path.resolve(global.__statics, 'preload.js'),
        'overlay-fullscreen-video': true,
        'overlay-scrollbars': true
      }
    }
  })

  mainWin.window.once('ready-to-show', () => {
    mainWin.show()
    mainWin.window.webContents.on('did-finish-load', kickStart)
  })

  mainWin.load(process.env.APP_URL)

  StateManager.init(Windows)
}

function kickStart () {
  // client binary stuff
  clientBinaryManager.on('status', (status, data) => {
    Windows.broadcast('uiAction_clientBinaryStatus', status, data)
  })

  // node connection stuff
  spectrumNode.on('nodeConnectionTimeout', () => {
    Windows.broadcast('uiAction_nodeStatus', 'connectionTimeout')
  })

  spectrumNode.on('nodeLog', data => {
    Windows.broadcast('uiAction_nodeLogText', data.replace(/^.*[0-9]]/, ''))
  })

  // state change
  spectrumNode.on('state', (state, stateAsText) => {
    Windows.broadcast('uiAction_nodeStatus', stateAsText,
      spectrumNode.STATES.ERROR === state ? spectrumNode.lastError : null
    )
  })

  // capture sync results
  const syncResultPromise = new Q((resolve, reject) => {
    nodeSync.on('nodeSyncing', result => {
      Windows.broadcast('uiAction_nodeSyncStatus', 'inProgress', result)
    })

    nodeSync.on('stopped', () => {
      Windows.broadcast('uiAction_nodeSyncStatus', 'stopped')
    })

    nodeSync.on('error', err => {
      log.error('Error syncing node', err)

      reject(err)
    })

    nodeSync.on('finished', () => {
      nodeSync.removeAllListeners('error')
      nodeSync.removeAllListeners('finished')

      resolve()
    })
  })

  Q.resolve()
    .then(() => {
      return clientBinaryManager.init()
    })
    .then(() => {
      return spectrumNode.init()
    })
    .then(() => {
      log.info('Spectrum node started.')
      // TODO
      // update menu, to show node switching possibilities
      // appMenu()
    })
    .then(function doSync () {
      return syncResultPromise
    })
    .then(function allDone () {
      log.info('all done!')
      // sync data to front
      StateManager.emit('sync')

      Windows.broadcast(Types.NODE_ALL_DONE)
    })
    .catch(err => {
      log.error('Error starting up node and/or syncing', err)
    })
} /* kick start */
