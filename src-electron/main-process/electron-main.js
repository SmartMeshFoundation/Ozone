'use strict'

import { app, BrowserWindow } from 'electron'
import db from '../lib/dbManager'
import channel from '../lib/channelManager'
import setting from '../lib/setting'
import Web3 from 'web3'
import log from '../lib/log'

if (process.env.PROD) {
  global.__statics = require('path')
    .join(__dirname, 'statics')
    .replace(/\\/g, '\\\\')
}

if (process.env.DEV) {
  // TODO 修改成从环境变量读取
}

function init () {
  log.debug('\n================= process.env ================= \n', process.env)

  global.web3 = new Web3(
    new Web3.providers.WebsocketProvider('ws://localhost:8546')
  )

  log.info('web3 version: ', global.web3.version)

  global.db = db
  global.setting = setting
}

let mainWindow = null

function createMainWindow () {
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

app.on('ready', () => {
  init()
  createMainWindow()
  channel.bind(mainWindow)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow()
  }
})
