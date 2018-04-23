import { app } from 'electron'
import path from 'path'
import logger from './logger'
import fs from 'fs-extra'

let packageJson
if (process.env.PROD) {
  packageJson = require(path.join(__dirname, 'package.json'))
} else {
  packageJson = require('../../package.json')
}

class Settings {
  constructor () {
    this.init()
  }

  init () {
    this._log = logger.create('Settings')
  }

  get syncmode () {
    return 'fast'
  }

  get network () {
    return 'test'
  }

  get nodeType () {
    return 'geth'
  }

  get nodeOptions () {
    return []
  }

  get userDataPath () {
    return app.getPath('userData')
  }

  get dbFilePath () {
    const dbFileName = this.appName + '.lokidb'
    return path.join(this.userDataPath, dbFileName)
  }

  get appDataPath () {
    // Application Support/
    return app.getPath('appData')
  }

  get userHomePath () {
    return app.getPath('home')
  }

  get appVersion () {
    return packageJson.version
  }

  get appName () {
    return packageJson.name
  }

  get appLicense () {
    return packageJson.license
  }

  get inProductionMode () {
    return process.env.PROD
  }

  get productName () {
    return packageJson.productName
  }

  get appDescription () {
    return packageJson.description
  }

  get platform () {
    return process.platform
      .replace('darwin', 'mac')
      .replace('win32', 'win')
      .replace('freebsd', 'linux')
      .replace('sunos', 'linux')
  }

  get isTestnet () {
    return this.network === 'test'
  }

  get chainDataPath () {
    let dataDir = this.userHomePath
    if (this.platform === 'win') {
      dataDir = path.join(dataDir, 'AppData', 'Roaming', 'Spectrum')
    } else if (this.platform === 'mac') {
      dataDir = path.join(dataDir, 'Library', 'Spectrum')
    } else {
      dataDir = path.join(dataDir, '.spectrum')
    }
    if (this.isTestnet) {
      dataDir = path.join(dataDir, 'testnet')
    }

    return dataDir
  }

  get ipcConnection () {
    return path.join(this.chainDataPath, 'smc.ipc')
  }

  // get web3Provider () {
  //   // return `ws://localhost:${wsport}`
  //   return path.join(this.chainDataPath, 'geth.ipc')
  // }

  loadUserData (path2) {
    const fullPath = this.constructUserDataPath(path2)

    this._log.trace('Load user data', fullPath)

    // check if the file exists
    try {
      fs.accessSync(fullPath, fs.R_OK)
    } catch (err) {
      return null
    }

    // try to read it
    try {
      const data = fs.readFileSync(fullPath, { encoding: 'utf8' })
      this._log.debug(`Reading "${data}" from ${fullPath}`)
      return data
    } catch (err) {
      this._log.warn(`File not readable: ${fullPath}`, err)
    }

    return null
  }

  saveUserData (path2, data) {
    if (!data) return // return so we dont write null, or other invalid data

    const fullPath = this.constructUserDataPath(path2)

    try {
      this._log.debug(`Saving "${data}" to ${fullPath}`)
      fs.writeFileSync(fullPath, data, { encoding: 'utf8' })
    } catch (err) {
      this._log.warn(`Unable to write to ${fullPath}`, err)
    }
  }

  constructUserDataPath (filePath) {
    return path.join(this.userDataPath, filePath)
  }
}

export default new Settings()
