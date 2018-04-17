'use strict'

import { app, BrowserWindow } from 'electron'
import Settings from '../lib/settings'
import db from '../lib/db'

import Web3 from 'web3'
import logger from '../lib/logger'
import path from 'path'

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

// TODO change
global.web3 = new Web3('ws://localhost:8546')
log.info('web3 version: ', global.web3.version)

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
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.loadURL(process.env.APP_URL)
}
