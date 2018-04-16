'use strict'

import { app, BrowserWindow } from 'electron'
import settings from '../lib/settings'
import db from '../lib/db'
// import channel from '../lib/channelManager'
import Web3 from 'web3'
import logger from '../lib/logger'
import path from 'path'

const log = logger.create('Main')

settings.init()

log.info(`Running in production mode: ${settings.inProductionMode}`)

if (process.env.PROD) {
  global.__statics = path.join(__dirname, 'statics').replace(/\\/g, '\\\\')
}

global.settings = settings
global.db = db

log.debug('\n================= process.env ================= \n', process.env)
log.debug('userDataPath = ', settings.userDataPath)
log.debug('userHomePath = ', settings.userHomePath)
log.debug('appDataPath = ', settings.appDataPath)

// prevent crashed and close gracefully
process.on('uncaughtException', (error) => {
  log.error('UNCAUGHT EXCEPTION', error)
  app.quit()
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit()
})

// TODO change
global.web3 = new Web3('ws://localhost:8546')
log.info('web3 version: ', global.web3.version)

let mainWindow = null

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })

// app.on('activate', () => {
//   if (mainWindow === null) {
//     createMainWindow()
//   }
// })

app.on('ready', () => {
  // initialise the db
  global.db.init().then(onReady).catch((err) => {
    log.error(err)
    app.quit()
  })

  // init()
  // createMainWindow()
  // channel.bind(mainWindow)
})

let onReady = () => {
  // TODO show splash window
  createMainWindow()
}

let createMainWindow = () => {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    useContentSize: true
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.loadURL(process.env.APP_URL)
}
