import { app } from 'electron'
import path from 'path'
import fs from 'fs-extra'

let instance = null

const APP_NAME = 'ozone'
const APP_VER = '0.0.1'

class Settings {
  _chainDataPath = null

  constructor () {
    if (!instance) {
      instance = this
    }

    return instance
  }

  get chainDataPath () {
    if (this._chainDataPath == null) {
      let dataPath = app.getPath('home')
      if (this.platform === 'mac') {
        dataPath = path.join(dataPath, '.' + APP_NAME)
      } else if (this.platform === 'win') {
        dataPath = app.getPath('appData')
        dataPath = path.join(dataPath, APP_NAME)
      } else {
        dataPath = path.join(dataPath, APP_NAME)
      }
      this._chainDataPath = dataPath

      fs.ensureDirSync(dataPath)
    }

    return this._chainDataPath
  }

  set chainDataPath (path) {
    this._chainDataPath = path
    fs.ensureDirSync(path)
  }

  get userDataPath () {
    return app.getPath('userData')
  }

  get platform () {
    return process.platform
      .replace('darwin', 'mac')
      .replace('win32', 'win')
      .replace('freebsd', 'linux')
      .replace('sunos', 'linux')
  }

  get appName () {
    return APP_NAME
  }

  get appVer () {
    return APP_VER
  }

  get runArgs () {
    return [
      '--ws',
      '--wsorigins',
      '*',
      '--wsapi="db,eth,net,web3,personal,admin,accounts,subscribe,web3"'
    ]
  }
}

export default new Settings()
