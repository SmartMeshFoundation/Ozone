/**
 * This file is used specifically and only for development. It installs
 * `electron-debug` & `vue-devtools`. There shouldn't be any need to
 *  modify this file, but it can be used to extend your development
 *  environment.
 */
import { app, BrowserWindow } from 'electron'

// Install `electron-debug` with `devtron`
require('electron-debug')({ showDevTools: true })

// Install `vue-devtools`
app.on('ready', () => {
  // let installExtension = require('electron-devtools-installer')
  // installExtension.default(installExtension.VUEJS_DEVTOOLS)
  //   .then((name) => console.log(`Added Extension:  ${name}`))
  //   .catch(err => {
  //     console.log('Unable to install `vue-devtools`: \n', err)
  //   })
  let ext = '/Users/wu/Library/Application Support/Google/Chrome/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd/4.1.4_0'
  new Promise(() => {
    BrowserWindow.addDevToolsExtension(ext)
  }).then(() => {
    console.log('Loading vue-devtools extension.')
  }).catch(() => {
    console.log('Failed to loading vue-devtools extension from [', ext, ']')
  })
})

// Require `main` process to boot app
require('./electron-main')
