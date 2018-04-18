'use strict'

import { app, dialog, BrowserWindow } from 'electron'
import path from 'path'
import Q from 'bluebird'
import Settings from '../lib/settings'
import db from '../lib/db'
import logger from '../lib/logger'
import clientBinaryManager from '../lib/clientBinaryManager'
import spectrumNode from '../lib/spectrumNode'
import nodeSync from '../lib/nodeSync'
import web3Mannager from '../lib/web3Mannager'

if (process.env.PROD) {
  global.__statics = path.join(__dirname, 'statics').replace(/\\/g, '\\\\')
}

const log = logger.create('Main')

Settings.init()

log.info(`Running in production mode: ${Settings.inProductionMode}`)

global.settings = Settings
global.db = db

log.debug('\n================= process.env ================= \n', process.env)
log.debug('userDataPath = ', Settings.userDataPath)
log.debug('userHomePath = ', Settings.userHomePath)
log.debug('appDataPath = ', Settings.appDataPath)

let mainWindow = null

// prevent crashed and close gracefully
process.on('uncaughtException', error => {
  log.error('UNCAUGHT EXCEPTION', error)
  app.quit()
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  Promise.try(global.db.close())
    .then(() => {
      app.quit()
    })
    .catch(error => {
      log.error(error)
      app.quit()
    })
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

function onReady () {
  createMainWindow()
}

function createMainWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    show: false,
    title: Settings.appDescription,
    width: 1000,
    height: 600,
    backgroundColor: '#2e2c29',
    useContentSize: true
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    mainWindow.webContents.on('did-finish-load', kickStart)
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.loadURL(process.env.APP_URL)
}

function kickStart () {
  // client binary stuff
  clientBinaryManager.on('status', (status, data) => {
    log.info('ClientBinaryManager emited: ', status, ', data: ', data)
  })

  // node connection stuff
  spectrumNode.on('nodeConnectionTimeout', () => {
    // Windows.broadcast('uiAction_nodeStatus', 'connectionTimeout')
  })

  spectrumNode.on('nodeLog', (data) => {
    // Windows.broadcast('uiAction_nodeLogText', data.replace(/^.*[0-9]]/, ''))
  })

  // state change
  spectrumNode.on('state', (state, stateAsText) => {
    // Windows.broadcast('uiAction_nodeStatus', stateAsText,
    //   spectrumNode.STATES.ERROR === state ? spectrumNode.lastError : null
    // )
  })

  // capture sync results
  const syncResultPromise = new Q((resolve, reject) => {
    nodeSync.on('nodeSyncing', (result) => {
      // Windows.broadcast('uiAction_nodeSyncStatus', 'inProgress', result)
    })

    nodeSync.on('stopped', () => {
      // Windows.broadcast('uiAction_nodeSyncStatus', 'stopped')
    })

    nodeSync.on('error', (err) => {
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
      return web3Mannager.init()
    })
    .then(() => {
      log.info('Spectrum node started.')
      global.web3 = web3Mannager.web3

      // TODO
      // update menu, to show node switching possibilities
      // appMenu()
    })
    .then(function doSync () {
      return syncResultPromise
    })
    .then(function allDone () {
      startMainWindow()
    })
    .catch((err) => {
      log.error('Error starting up node and/or syncing', err)
    }) /* socket connected to geth */
}; /* kick start */
