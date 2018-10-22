import { app } from 'electron'
import path from 'path'
import logger from './logger'
import fs from 'fs-extra'

import packageJson from '../../package.json'

import db from './db'

const _defaults = {
  network: process.env.PROD ? 'main' : 'test',
  syncmode: 'fast',
  nodeType: 'smc',
  ipcFile: 'smc.ipc',
  rpcPort: 18545,
  wsPort: 18546,
  requiredConfirmations: 17
}

class Settings {
  constructor () {
    this._log = logger.create('Settings')
  }

  loadSysconfig () {
    const sysconfig = db.sysconfig
    const network = sysconfig.by('_id', 'network')
    const netConfig = network ? network.config : null
    this._log.debug(`Load sysconfig: network=${netConfig}`)
    if (netConfig) {
      this.network = netConfig
    }
  }

  get syncmode () {
    return _defaults.syncmode
  }

  get network () {
    return this._network || _defaults.network
  }

  set network (nw) {
    this._network = nw
    let network = db.sysconfig.by('_id', 'network')
    if (network) {
      network.config = nw
      db.sysconfig.update(network)
    } else {
      network = {
        _id: 'network',
        config: nw
      }
      db.sysconfig.insert(network)
    }
  }

  get nodeType () {
    return _defaults.nodeType
  }

  get rpcPort () {
    return _defaults.rpcPort
  }

  get wsPort () {
    return _defaults.wsPort
  }

  get nodeOptions () {
    return []
  }

  get requiredConfirmations () {
    return _defaults.requiredConfirmations
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

  get appCopyright () {
    return packageJson.copyright
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

  get chainDataDir () {
    return path.join(this.chainDataPath, 'smc', 'chaindata')
  }

  get ipcConnection () {
    if (this.platform === 'win') {
      return '\\\\.\\pipe\\' + _defaults.ipcFile
    } else {
      return path.join(this.chainDataPath, _defaults.ipcFile)
    }
  }

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
