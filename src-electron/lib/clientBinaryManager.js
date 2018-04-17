import _ from 'lodash'
import Q from 'bluebird'
import fs from 'fs'
import { app, dialog } from 'electron'
import got from 'got'
import path from 'path'
import Settings from './settings'
import Windows from './windows'
import { Manager as ClientBinaryManager } from 'ethereum-client-binaries'
import { EventEmitter } from 'events'

const log = require('./logger').create('ClientBinaryManager')

const BINARY_URL = 'https://github.com/wuynng/spectrumclient/raw/master/clientBinaries.json'

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
    let binariesDownloaded = false
    let nodeInfo

    log.info(`Checking for new client binaries config from: ${BINARY_URL}`)

    this._emit('loadConfig', 'Fetching remote client config')

    // fetch config
    return got(BINARY_URL, {
      timeout: 3000,
      json: true
    })
      .then((res) => {
        if (!res || _.isEmpty(res.body)) {
          throw new Error('Invalid fetch result')
        } else {
          return res.body
        }
      })
      .catch((err) => {
        log.warn('Error fetching client binaries config from repo', err)
      })
      .then((latestConfig) => {
        if (!latestConfig) return

        let localConfig
        let skipedVersion
        const nodeVersion = latestConfig.version

        this._emit('loadConfig', 'Fetching local config')

        try {
          // now load the local json
          localConfig = JSON.parse(
            fs.readFileSync(path.join(Settings.userDataPath, 'clientBinaries.json')).toString()
          )
        } catch (err) {
          log.warn(`Error loading local config - assuming this is a first run: ${err}`)

          if (latestConfig) {
            localConfig = latestConfig

            this._writeLocalConfig(localConfig)
          } else {
            throw new Error('Unable to load local or remote config, cannot proceed!')
          }
        }

        try {
          skipedVersion = fs.readFileSync(path.join(Settings.userDataPath, 'skippedNodeVersion.json')).toString()
        } catch (err) {
          log.info('No "skippedNodeVersion.json" found.')
        }

        // prepare node info
        const platform = process.platform.replace('darwin', 'mac').replace('win32', 'win').replace('freebsd', 'linux').replace('sunos', 'linux')
        const binaryVersion = latestConfig[platform]
        const checksums = _.pick(binaryVersion.download, 'sha256', 'md5')
        const algorithm = _.keys(checksums)[0].toUpperCase()
        const hash = _.values(checksums)[0]

        // get the node data, to be able to pass it to a possible error
        nodeInfo = {
          version: nodeVersion,
          checksum: hash,
          algorithm
        }

        // if new config version available then ask user if they wish to update
        if (latestConfig &&
                JSON.stringify(localConfig) !== JSON.stringify(latestConfig) &&
                nodeVersion !== skipedVersion) {
          return new Q((resolve) => {
            log.debug('New client binaries config found, asking user if they wish to update...')

            this._writeLocalConfig(latestConfig)

            resolve(latestConfig)
          })
        }

        return localConfig
      })
      .then((localConfig) => {
        if (!localConfig) {
          log.info('No config for the ClientBinaryManager could be loaded, using local clientBinaries.json.')

          const localConfigPath = path.join(Settings.userDataPath, 'clientBinaries.json')
          localConfig = (fs.existsSync(localConfigPath)) ? require(localConfigPath) : require('../clientBinaries.json') // eslint-disable-line no-param-reassign, global-require, import/no-dynamic-require, import/no-unresolved
        }

        // scan for node
        const mgr = new ClientBinaryManager(localConfig)
        mgr.logger = log

        this._emit('scanning', 'Scanning for binaries')

        return mgr.init({
          folders: [
            path.join(Settings.userDataPath, 'binaries', 'Geth', 'unpacked'),
            path.join(Settings.userDataPath, 'binaries', 'Eth', 'unpacked')
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

              return Q.map(_.values(clients), (c) => {
                binariesDownloaded = true

                return mgr.download(c.id, {
                  downloadFolder: path.join(Settings.userDataPath, 'binaries'),
                  urlRegex: ALLOWED_DOWNLOAD_URLS_REGEX
                })
              })
            }
          })
          .then(() => {
            this._emit('filtering', 'Filtering available clients')

            _.each(mgr.clients, (client) => {
              if (client.state.available) {
                const idlcase = client.id.toLowerCase()

                this._availableClients[idlcase] = {
                  binPath: Settings[`${idlcase}Path`] || client.activeCli.fullPath,
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
      .catch((err) => {
        log.error(err)

        this._emit('error', err.message)

        // show error
        if (err.message.indexOf('Hash mismatch') !== -1) {
          // show hash mismatch error
          dialog.showMessageBox({
            type: 'warning',
            buttons: ['OK'],
            message: global.i18n.t('mist.errors.nodeChecksumMismatch.title'),
            detail: global.i18n.t('mist.errors.nodeChecksumMismatch.description', {
              type: nodeInfo.type,
              version: nodeInfo.version,
              algorithm: nodeInfo.algorithm,
              hash: nodeInfo.checksum
            })
          }, () => {
            app.quit()
          })

          // throw so the main.js can catch it
          throw err
        }
      })
  }

  _emit (status, msg) {
    log.debug(`Status: ${status} - ${msg}`)

    this.emit('status', status, msg)
  }

  _resolveEthBinPath () {
    log.info('Resolving path to Eth client binary ...')

    let platform = process.platform

    // "win32" -> "win" (because nodes are bundled by electron-builder)
    if (platform.indexOf('win') === 0) {
      platform = 'win'
    } else if (platform.indexOf('darwin') === 0) {
      platform = 'mac'
    }

    log.debug(`Platform: ${platform}`)

    let binPath = path.join(
      __dirname,
      '..',
      'nodes',
      'eth',
      `${platform}-${process.arch}`
    )

    if (Settings.inProductionMode) {
      // get out of the ASAR
      binPath = binPath.replace('nodes', path.join('..', '..', 'nodes'))
    }

    binPath = path.join(path.resolve(binPath), 'eth')

    if (platform === 'win') {
      binPath += '.exe'
    }

    log.info(`Eth client binary path: ${binPath}`)

    this._availableClients.eth = {
      binPath,
      version: '1.3.0'
    }
  }
}

module.exports = new Manager()
