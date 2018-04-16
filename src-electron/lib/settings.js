import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import logger from './logger'
const packageJson = require('../../package.json')
import _ from 'lodash'

// try loading in config file
const defaultConfig = {
  production: false
}
try {
  _.extend(defaultConfig, require('../config.json'))
} catch (err) {
}

// Global log4js options
const loggerConfig = {
  loglevel: 'debug'
}

class Settings {
  init () {
    logger.setup(loggerConfig)

    this._log = logger.create('Settings')
  }

  get userDataPath () {
    // Application Aupport/Mist
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

const settings = new Settings()

export default settings
