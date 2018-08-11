import _ from 'lodash'
import Q from 'bluebird'
import fs from 'fs-extra'
import { app, dialog } from 'electron'
import got from 'got'
import path from 'path'
import { Manager as ClientBinaryManager } from './client/manager'
import { EventEmitter } from 'events'
import Settings from './settings'
import logger from './logger'

const log = logger.create('ClientBinaryManager')

const BINARY_URL = 'https://raw.githubusercontent.com/SmartMeshFoundation/Ozone/master/clientBinaries.json'
// const BINARY_URL = 'https://raw.githubusercontent.com/wuynng/spectrumclient/master/clientBinaries.json'

import defaultClientBinaries from './client/config.json'

class Manager extends EventEmitter {
  constructor () {
    super()

    this._availableClients = {}
  }

  init (restart) {
    log.info('Initializing...')

    // check every hour
    setInterval(() => this._checkForNewConfig(true), 1000 * 60 * 60)

    return this._checkForNewConfig(restart)
  }

  getClient (clientId) {
    return this._availableClients[clientId.toLowerCase()]
  }

  _writeLocalConfig (json) {
    log.info('Write new client binaries local config to disk ...')

    fs.writeFileSync(
      path.join(Settings.userDataPath, 'clientBinaries.json'),
      JSON.stringify(json, null, 2)
    )
  }

  _checkForNewConfig (restart) {
    const nodeType = 'Smc'
    let binariesDownloaded = false
    let nodeInfo

    log.info(`Checking for new client binaries config from: ${BINARY_URL}`)

    this._emit('loadConfig', 'Fetching remote client config')

    // fetch config
    return got(BINARY_URL, {
      timeout: 10000,
      json: true
    })
      .then(res => {
        if (!res || _.isEmpty(res.body)) {
          throw new Error('Invalid fetch result')
        } else {
          return res.body
        }
      })
      .catch(err => {
        log.warn('Error fetching client binaries config from repo', err)
      })
      .then(latestConfig => {
        if (!latestConfig) return

        log.info('latestConfig', latestConfig)

        let localConfig
        let skipedVersion
        const nodeVersion = latestConfig.clients[nodeType].version

        this._emit('loadConfig', 'Fetching local config')

        try {
          // now load the local json
          localConfig = JSON.parse(
            fs
              .readFileSync(
                path.join(Settings.userDataPath, 'clientBinaries.json')
              )
              .toString()
          )
        } catch (err) {
          log.warn(
            `Error loading local config - assuming this is a first run: ${err}`
          )

          if (latestConfig) {
            localConfig = latestConfig

            this._writeLocalConfig(localConfig)
          } else {
            throw new Error(
              'Unable to load local or remote config, cannot proceed!'
            )
          }
        }

        try {
          skipedVersion = fs
            .readFileSync(
              path.join(Settings.userDataPath, 'skippedNodeVersion.json')
            )
            .toString()
        } catch (err) {
          log.info('No "skippedNodeVersion.json" found.')
          skipedVersion = ''
        }

        // prepare node info
        const platform = process.platform
          .replace('darwin', 'mac')
          .replace('win32', 'win')
          .replace('freebsd', 'linux')
          .replace('sunos', 'linux')
        const binaryVersion = latestConfig.clients[nodeType].platforms[platform]
        const checksums = _.pick(binaryVersion.download, 'md5')
        const algorithm = _.keys(checksums)[0].toUpperCase()
        const hash = _.values(checksums)[0]

        // get the node data, to be able to pass it to a possible error
        nodeInfo = {
          type: nodeType,
          version: nodeVersion,
          checksum: hash,
          algorithm
        }

        // if new config version available then ask user if they wish to update
        if (
          latestConfig &&
          JSON.stringify(localConfig) !== JSON.stringify(latestConfig) &&
          nodeVersion !== skipedVersion
        ) {
          return new Q(resolve => {
            log.debug(
              'New client binaries config found, asking user if they wish to update...'
            )
            // TODO popup window ask user
            this._writeLocalConfig(latestConfig)
            resolve(latestConfig)
          })
        }

        return localConfig
      })
      .then(localConfig => {
        if (!localConfig) {
          log.info(
            'No config for the ClientBinaryManager could be loaded, using local clientBinaries.json.'
          )

          const localConfigPath = path.join(
            Settings.userDataPath,
            'clientBinaries.json'
          )
          localConfig = fs.existsSync(localConfigPath)
            ? JSON.parse(fs.readFileSync(localConfigPath))
            : defaultClientBinaries
        }

        log.debug('localConfig is: \n', localConfig)

        // scan for node
        const mgr = new ClientBinaryManager(localConfig)
        mgr.logger = log

        this._emit('scanning', 'Scanning for binaries')

        return mgr
          .init({
            folders: [
              path.join(Settings.userDataPath, 'binaries', 'Smc', 'unpacked')
            ]
          })
          .then(() => {
            const clients = mgr.clients

            this._availableClients = {}

            const available = _.filter(clients, c => !!c.state.available)

            if (!available.length) {
              if (_.isEmpty(clients)) {
                throw new Error('No client binaries available for this system!')
              }

              this._emit('downloading', 'Downloading binaries')

              return Q.map(_.values(clients), c => {
                binariesDownloaded = true

                return mgr.download(c.id, {
                  downloadFolder: path.join(Settings.userDataPath, 'binaries')
                })
              })
            }
          })
          .then(() => {
            this._emit('filtering', 'Filtering available clients')

            _.each(mgr.clients, client => {
              if (client.state.available) {
                const idlcase = client.id.toLowerCase()

                this._availableClients[idlcase] = {
                  binPath:
                    Settings[`${idlcase}Path`] || client.activeCli.fullPath,
                  version: client.version
                }
              }
            })

            // restart if it downloaded while running
            if (restart && binariesDownloaded) {
              log.info('Restarting app ...')
              app.relaunch()
              app.quit()
            }

            this._emit('done')
          })
      })
      .catch(err => {
        log.error(err)

        this._emit('error', err.message)

        // show error
        if (err.message.indexOf('Hash mismatch') !== -1) {
          // show hash mismatch error
          dialog.showMessageBox(
            {
              type: 'warning',
              buttons: ['OK'],
              message: global.i18n.t('ozone.errors.nodeChecksumMismatch.title'),
              detail: global.i18n.t(
                'ozone.errors.nodeChecksumMismatch.description',
                {
                  type: nodeInfo.type,
                  version: nodeInfo.version,
                  algorithm: nodeInfo.algorithm,
                  hash: nodeInfo.checksum
                }
              )
            },
            () => {
              // remove downloaded archive.tar
              fs.removeSync(path.join(Settings.userDataPath, 'binaries', nodeType, 'archive.tar'))
              app.quit()
            }
          )

          // throw so the main.js can catch it
          throw err
        }
      })
  }

  _emit (status, msg) {
    log.debug(`Status: ${status} - ${msg}`)

    this.emit('status', status, msg)
  }
}

export default new Manager()
