/**
The nodeSync module,
checks the current node whether its synching or not and how much it kept up already.

@module nodeSync
*/

import _ from 'lodash'
import Q from 'bluebird'
import { EventEmitter } from 'events'
import { ipcMain as ipc } from 'electron'
import Web3 from 'web3'
import net from 'net'
import spectrumNode from './spectrumNode'
import logger from './logger'
import Settings from './settings'

const log = logger.create('NodeSync')

const SYNC_CHECK_INTERVAL_MS = 2000

class NodeSync extends EventEmitter {
  constructor () {
    super()

    spectrumNode.on('state', _.bind(this._onNodeStateChanged, this))
  }

  /**
   * @return {Promise}
   */
  start () {
    if (this._syncPromise) {
      log.warn('Sync already in progress, returning Promise')

      return Q.resolve(this._syncPromise)
    }

    this._syncPromise = Q.try(() => {
      if (!(spectrumNode.state === spectrumNode.STATES.CONNECTED)) {
        throw new Error('Cannot sync - Spectrum node not yet connected')
      }

      return new Q((resolve, reject) => {
        log.info('Starting sync loop')

        this._syncInProgress = true
        this._onSyncDone = resolve
        this._onSyncError = reject

        this.emit('starting')

        ipc.on('backendAction_skipSync', () => {
          ipc.removeAllListeners('backendAction_skipSync')
          log.info('Sync has been skipped')

          this._onSyncDone()
        })

        this._sync()
      })
    })
      .then(() => {
        this.emit('finished')
      })
      .catch(err => {
        log.error('Sync error', err)

        this.emit('error', err)
      })
      .finally(() => {
        log.info('Sync loop ended')

        this._clearState()
      })

    return this._syncPromise
  }

  /**
   * @return {Promise}
   */
  stop () {
    return Q.try(() => {
      if (!this._syncInProgress) {
        log.debug('Sync not already in progress.')
      } else {
        log.info('Stopping sync loop')

        this._clearState()

        return Q.delay(SYNC_CHECK_INTERVAL_MS).then(() => {
          this.emit('stopped')
        })
      }
    })
  }

  _clearState () {
    ipc.removeAllListeners('backendAction_skipSync')

    this._syncInProgress = this._syncPromise = this._onSyncDone = this._onSyncError = false
  }

  _sync () {
    _.delay(() => {
      if (!this._syncInProgress) {
        log.debug('Sync no longer in progress, so ending sync loop.')

        return
      }

      log.trace('Check sync status')
      let web3 = global.web3
      web3.eth.isSyncing().then(result => {
        if (!result) {
          // got no result, let's check the block number
          log.debug('Check latest block number')

          return web3.eth.getBlock('latest')
            .then(block => {
              const blockResult = block
              const now = Math.floor(new Date().getTime() / 1000)

              if (!blockResult) {
                return this._sync()
              }

              log.debug(
                `Last block: ${Number(blockResult.number)}; timestamp: ${
                  blockResult.timestamp
                }`
              )

              const diff = now - +blockResult.timestamp

              // need sync if > 1 minute
              if (diff > 60) {
                this.emit('nodeSyncing', result)

                log.trace('Keep syncing...')

                return this._sync()
              }

              log.info('No more sync necessary')

              return this._onSyncDone()
            })
        } else {
          log.trace('Sync status ', result)
          // got an error?
          if (result.error) {
            if (result.error.code === -32601) {
              log.warn('Sync method not implemented, skipping sync.')

              return this._onSyncDone()
            }

            throw new Error(`Unexpected error: ${result.error}`)
          } else {
            // no error, so call again in a bit
            this.emit('nodeSyncing', result)

            return this._sync()
          }
        }
      })
        .catch(err => {
          log.error('Node crashed while syncing?', err)

          this._onSyncError(err)
        })
    }, SYNC_CHECK_INTERVAL_MS)
  }

  _onNodeStateChanged (state) {
    switch (state) { // eslint-disable-line default-case
      // stop syncing when node about to be stopped
      case spectrumNode.STATES.STOPPING:
        log.info('Spectrum node stopping, so stop sync')

        this.stop()
        break
      // auto-sync whenever node gets connected
      case spectrumNode.STATES.CONNECTED:
        log.info('Spectrum node connected, re-start sync')
        this._web3Init()
          .then(() => {
            // stop syncing, then start again
            this.stop().then(() => {
              this.start()
            })
          })
          .catch((err) => {
            log.error('Web3 failed to connected to node.')
            this.emit('error', err)
          })
        break
    }
  }

  _web3Init () {
    let web3, _resolve, _reject
    let web3Promise = new Promise((resolve, reject) => {
      _resolve = resolve
      _reject = reject
    })

    let providerUrl = Settings.web3Provider
    if (providerUrl.startsWith('http:') || providerUrl.startsWith('ws:')) {
      web3 = new Web3(providerUrl)
    } else {
      web3 = new Web3(new Web3.providers.IpcProvider(providerUrl, net))
    }

    web3.eth.net.isListening()
      .then(() => {
        global.web3 = web3
        _resolve(true)
      })
      .catch(_reject)

    return web3Promise
  }
}

export default new NodeSync()