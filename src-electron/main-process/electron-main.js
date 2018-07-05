'use strict'

import { app } from 'electron'
import path from 'path'
import Q from 'bluebird'
import Web3 from 'web3'
import _ from 'lodash'
import Settings from '../modules/settings'
import db from '../modules/db'
import logger from '../modules/logger'
import clientBinaryManager from '../modules/clientBinaryManager'
import spectrumNode from '../modules/spectrumNode'
import nodeSync from '../modules/nodeSync'
import windows from '../modules/windows'
import stateManager from '../modules/stateManager'
import observeManager from '../modules/observeManager'
import ipc from '../modules/ipc'
import { Types } from '../modules/ipc/types'
import OzoneMenu from '../modules/menu'

const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {})

if (shouldQuit) {
  process.exit(0)
}

const log = logger.create('Main')

log.info('current application\'s version: ', Settings.appVersion)
log.info('system language is ', app.getLocale())

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
log.debug('global.__statics = ', global.__statics)

global.icon = path.join(global.__statics, 'icon_smart.png')

global._ = _
global.settings = Settings
global.db = db
global.web3 = new Web3()
global.windows = windows
global.stateManager = stateManager

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
      await spectrumNode.stop()

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
  global.db
    .init()
    .then(onReady)
    .catch(err => {
      log.error(err)
      app.quit()
    })
})

let mainWin = null

function onReady () {
  mainWin = windows.create('main', {
    primary: true,
    electronOptions: {
      show: false,
      title: Settings.productName,
      width: 1000,
      height: 700,
      backgroundColor: '#2e2c29',
      useContentSize: true,
      webPreferences: {
        preload: path.resolve(global.__statics, 'preload.js'),
        'overlay-fullscreen-video': true,
        'overlay-scrollbars': true
      }
    }
  })

  let mwin = mainWin.window

  mwin.once('ready-to-show', () => {
    mainWin.show()
  })

  mwin.webContents.on('did-finish-load', kickStart)

  let ozoneMenu = new OzoneMenu(mwin)
  ozoneMenu.create()
  /** for context menus */

  mainWin.load(process.env.APP_URL)
}

function kickStart () {
  // client binary stuff
  clientBinaryManager.on('status', (status, data) => {
    windows.broadcast(Types.UI_ACTION_CLIENTBINARYSTATUS, status, data)
  })

  // node connection stuff
  spectrumNode.on('nodeConnectionTimeout', () => {
    windows.broadcast(Types.UI_ACTION_NODE_STATUS, 'connectionTimeout')
  })

  spectrumNode.on('nodeLog', data => {
    windows.broadcast(Types.UI_ACTION_NODE_LOGTEXT, data.replace(/^.*[0-9]]/, ''))
  })

  // state change
  spectrumNode.on('state', (state, stateAsText) => {
    windows.broadcast(
      'uiAction_nodeStatus',
      stateAsText,
      spectrumNode.STATES.ERROR === state ? spectrumNode.lastError : null
    )
  })

  // capture sync results
  const syncResultPromise = new Q((resolve, reject) => {
    nodeSync.on('nodeSyncing', result => {
      windows.broadcast(Types.NODE_SYNC_STATUS, 'inProgress', result)
    })

    nodeSync.on('stopped', () => {
      windows.broadcast(Types.NODE_SYNC_STATUS, 'stopped')
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
    nodeSync.on('syncBlock', (results) => {
      mainWin.webContents.send(Types.SYNC_BLOCK_NUMBER, results.currentBlock, results.highestBlock)
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
    })
    .then(function doSync () {
      return syncResultPromise
    })
    .then(function allDone () {
      log.info('all done!')

      ipc.bind()

      // sync data to front-end vuex store
      stateManager.emit('sync')

      observeManager.start()

      windows.broadcast(Types.NODE_ALL_DONE)
    })
    .catch(err => {
      log.error('Error starting up node and/or syncing', err)
    })
} /* kick start */
