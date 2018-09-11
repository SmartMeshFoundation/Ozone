import Loki from 'lokijs'
import fs from 'fs'
import Q from 'bluebird'

import settings from './settings'
import logger from './logger'

const log = logger.create('DatabaseManager')

class DatabaseManager {
  init () {
    const filePath = settings.dbFilePath

    return Q.try(() => {
      // if db file doesn't exist then create it
      try {
        log.debug(`Check that db exists and it's writeable: ${filePath}`)
        fs.accessSync(filePath, fs.R_OK | fs.W_OK)
        return Q.resolve()
      } catch (err) {
        log.info(`Creating db: ${filePath}`)

        const tempdb = new Loki(filePath, {
          env: 'NODEJS',
          autoload: false
        })

        return new Q.promisify(tempdb.saveDatabase, { context: tempdb })()
      }
    }).then(() => {
      log.info(`Loading db: ${filePath}`)

      return new Q((resolve, reject) => {
        this._db = new Loki(filePath, {
          env: 'NODEJS',
          autosave: true,
          autosaveInterval: 5000,
          autoload: true,
          autoloadCallback (err) {
            if (err) {
              log.error(err)
              reject(new Error('Error instantiating db'))
            }
            resolve()
          }
        })
      })
    })
  }

  getCollection (name) {
    if (!this._db.getCollection(name)) {
      this._db.addCollection(name, {
        unique: ['_id']
      })
    }

    return this._db.getCollection(name)
  }

  close () {
    return new Q((resolve, reject) => {
      this._db.close(err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  get accounts () {
    return this.getCollection('accounts')
  }

  get transactions () {
    return this.getCollection('transactions')
  }

  get contracts () {
    return this.getCollection('contracts')
  }

  get lock () {
    return this.getCollection('lock')
  }

  get tokens () {
    return this.getCollection('tokens')
  }

  get about () {
    return this.getCollection('about')
  }
}

export default new DatabaseManager()
