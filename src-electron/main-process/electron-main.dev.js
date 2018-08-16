/**
 * This file is used specifically and only for development. It installs
 * `electron-debug` & `vue-devtools`. There shouldn't be any need to
 *  modify this file, but it can be used to extend your development
 *  environment.
 */
// Install `electron-debug` with `devtron`
require('electron-debug')({ showDevTools: true })

const electron = require('electron')
const path = require('path')

electron.app.on('ready', () => {
  require('devtron').install()
  electron.BrowserWindow.addDevToolsExtension(path.join(__dirname, '..', '..', 'node_modules', 'vue-devtools', 'vender'))
})

// Require `main` process to boot app
require('./electron-main')
