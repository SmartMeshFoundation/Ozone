import { Menu, app } from 'electron'
import i18n from 'i18next'
import zh from './i18n/ozone.zh.i18n.json'
import en from './i18n/ozone.en.i18n.json'
import { Types } from '../modules/ipc/types'
import path from 'path'
import fs from 'fs'
import settings from './settings'
import spectrumNode from '../modules/spectrumNode'
import Q from 'bluebird'
import clientBinaryManager from '../modules/clientBinaryManager'
import stateManager from '../modules/stateManager'
import observeManager from '../modules/observeManager'
import nodeSync from '../modules/nodeSync'
import logger from '../modules/logger'
import rimraf from 'rimraf'
import _ from 'lodash'
const log = logger.create('Menu')

const resources = {
  dev: { translation: zh },
  en: { translation: en },
  zh: { translation: zh }
}

class OzoneMenu {
  constructor (mwin) {
    this.mwin = mwin
    i18n.getBestMatchedLangCode = langCode => {
      const codeList = Object.keys(resources)
      let bestMatchedCode = langCode
      if (codeList.indexOf(langCode) === -1) {
        if (codeList.indexOf(langCode.substr(0, 2)) > -1) {
          bestMatchedCode = langCode.substr(0, 2)
        } else {
          bestMatchedCode = 'en'
        }
      }
      return bestMatchedCode
    }

    let lan = app.getLocale()

    lan = lan.indexOf('zh') !== -1 ? 'zh' : 'en'

    global.language = lan

    i18n.init({
      lng: lan || 'zh',
      resources,
      interpolation: { prefix: '__', suffix: '__' }
    })
    global.i18n = i18n
    this.updateAbout()
  }

  updateAbout () {
    let about = {copyright: settings.appCopyright, version: global.i18n.t('ozone.version') + ' ' + settings.appVersion + ' (' + settings.appVersion + ')', appname: settings.appName, title: global.i18n.t('ozone.about')}
    let aboutInDb = global.db.about.by('_id', 1)
    if (aboutInDb) {
      _.extend(aboutInDb, about)
      global.db.about.update(aboutInDb)
    } else {
      about['_id'] = 1
      global.db.about.insert(about)
    }
  }

  kickStart (restart) {
    // client binary stuff
    clientBinaryManager.on('status', (status, data) => {
      global.windows.broadcast(Types.UI_ACTION_CLIENTBINARYSTATUS, status, data)
    })

    // node connection stuff
    spectrumNode.on('nodeConnectionTimeout', () => {
      global.windows.broadcast(Types.UI_ACTION_NODE_STATUS, 'connectionTimeout')
    })

    spectrumNode.on('nodeLog', data => {
      global.windows.broadcast(Types.UI_ACTION_NODE_LOGTEXT, data.replace(/^.*[0-9]]/, ''))
    })

    // state change
    spectrumNode.on('state', (state, stateAsText) => {
      global.windows.broadcast(
        'uiAction_nodeStatus',
        stateAsText,
        spectrumNode.STATES.ERROR === state ? spectrumNode.lastError : null
      )
    })

    // capture sync results
    const syncResultPromise = new Q((resolve, reject) => {
      nodeSync.on('nodeSyncing', result => {
        global.windows.broadcast(Types.NODE_SYNC_STATUS, 'inProgress', result)
      })

      nodeSync.on('stopped', () => {
        global.windows.broadcast(Types.NODE_SYNC_STATUS, 'stopped')
      })

      nodeSync.on('error', err => {
        log.error('Error syncing node', err)

        reject(err)
      })

      nodeSync.on('finished', () => {
        nodeSync.removeAllListeners('error')
        nodeSync.removeAllListeners('finished')

        resolve()
      })
      nodeSync.on('syncBlock', (results) => {
        this.mwin.webContents.send(Types.SYNC_BLOCK_NUMBER, results.currentBlock, results.highestBlock)
      })
    })

    Q.resolve()
      .then(() => {
        observeManager.stop()
        global.windows.broadcast(Types.OZONE_RELAUCH)
        return clientBinaryManager.init(true)
      }).then(() => {
        if (restart) {
          return spectrumNode.restart(settings.nodeType, settings.network, settings.syncmode)
        }
        return spectrumNode.init()
      })
      .then(() => {
        log.info('Spectrum node restarted.')
      })
      .then(function doSync () {
        return syncResultPromise
      })
      .then(function allDone () {
        log.info('all done!')

        // sync data to front-end vuex store
        stateManager.emit('sync')

        observeManager.start()

        global.windows.broadcast(Types.NODE_ALL_DONE)
      })
      .catch(err => {
        log.error('Error starting up node and/or syncing', err)
      })
  }

  create () {
    this.updateAbout()

    const selectionMenu = Menu.buildFromTemplate([
      { role: 'copy', label: global.i18n.t('selectionMenu.copy'), accelerator: 'CmdOrCtrl+C' },
      { type: 'separator' },
      { role: 'selectall', label: global.i18n.t('selectionMenu.selectall') }
    ])

    const editSubmenus = [
      { role: 'undo', label: global.i18n.t('inputMenu.undo'), accelerator: 'CmdOrCtrl+Z' },
      { role: 'redo', label: global.i18n.t('inputMenu.redo'), accelerator: 'Shift+CmdOrCtrl+Z' },
      { type: 'separator' },
      { role: 'cut', label: global.i18n.t('inputMenu.cut'), accelerator: 'CmdOrCtrl+X' },
      { role: 'copy', label: global.i18n.t('inputMenu.copy'), accelerator: 'CmdOrCtrl+C' },
      { role: 'paste', label: global.i18n.t('inputMenu.paste'), accelerator: 'CmdOrCtrl+V' },
      { type: 'separator' },
      { role: 'selectall', label: global.i18n.t('inputMenu.selectall') }
    ]
    const inputMenu = Menu.buildFromTemplate(editSubmenus)

    const currentLanguage = global.language

    const languageMenu = Object.keys(global.i18n.options.resources)
      .filter(langCode => langCode !== 'dev')
      .map(langCode => {
        const menuItem = {
          label: global.i18n.t(`appMenu.langCodes.${langCode}`),
          type: 'checkbox',
          checked: langCode === currentLanguage,
          click: () => {
            this.mwin.webContents.send(Types.SWITCH_LAN, langCode)
            global.language = langCode
            global.i18n.changeLanguage(langCode)
            this.create()
          }
        }
        return menuItem
      })
    // let net = ['test', 'main']
    // let netMenue = net.map(net_ => {
    //   return {
    //     label: global.i18n.t(`debugMenu.${net_}`),
    //     type: 'checkbox',
    //     checked: settings.network === net_,
    //     click: () => {
    //       settings.network_ = net_
    //       this.create()
    //       this.kickStart(true)
    //       spectrumNode._loadDefaults()
    //     }
    //   }
    // })
    const debugSubmenus = [
      // {
      //   label: global.i18n.t('debugMenu.net'),
      //   submenu: netMenue
      // },
      // {type: 'separator'},
      {
        label: global.i18n.t('debugMenu.log'),
        click: () => {
          let filename = path.resolve(app.getPath('userData'), 'ozone.log')
          fs.writeFileSync(path.resolve(app.getPath('desktop'), 'ozone.log'), fs.readFileSync(filename))
          global.windows.broadcast(Types.OZONE_LOG_DOWNLOADED)
        }
      },
      {type: 'separator'},
      {
        label: global.i18n.t('debugMenu.rmData'),
        click: () => {
          spectrumNode.stop().then(() => {
            rimraf(settings.chainDataDir, (err) => {
              if (err) {
                log.error('remove chain data encounter an error:', err)
              } else {
                log.info('remove chain data success')
                this.kickStart()
              }
            })
          })
        }
      },
      {
        label: global.i18n.t('debugMenu.loginLock'),
        click: () => {
          global.windows.broadcast(Types.LOGIN_LOCK_SETTING)
        }
      }
    ]

    const appMenu = [
      {
        label: global.i18n.t('appMenu.language-switch'),
        submenu: languageMenu
      },
      {
        label: global.i18n.t('appMenu.debug'),
        submenu: debugSubmenus
      }
    ]

    if (process.platform === 'darwin') {
      appMenu.unshift({
        label: app.getName(),
        submenu: [
          {
            role: 'about',
            label: global.i18n.t('appMenu.about') + ' ' + app.getName()
          },

          {type: 'separator'},

          {
            role: 'services',
            label: global.i18n.t('appMenu.services'),
            submenu: []
          },

          {type: 'separator'},

          {
            role: 'hide',
            label: global.i18n.t('appMenu.hide')
          },

          {
            role: 'hideothers',
            label: global.i18n.t('appMenu.hideothers')
          },

          {
            role: 'unhide',
            label: global.i18n.t('appMenu.unhide')
          },

          {type: 'separator'},

          {
            role: 'quit',
            label: global.i18n.t('appMenu.quit') + ' ' + app.getName()
          }

        ]
      })
    } else {
      appMenu.unshift({
        label: app.getName(),
        submenu: [
          {
            label: global.i18n.t('appMenu.about') + ' ' + app.getName(),
            click: () => {
              let aboutWindow = global.windows.create('about', {
                electronOptions: {
                  show: false,
                  width: 284,
                  height: 160,
                  backgroundColor: '#ECECEC',
                  useContentSize: true,
                  minimizable: false,
                  maximizable: false,
                  alwaysOnTop: true,
                  fullscreen: false,
                  fullscreenable: false,
                  resizable: false,
                  webPreferences: {
                    preload: path.resolve(global.__statics, 'preload.js'),
                    'overlay-fullscreen-video': true,
                    'overlay-scrollbars': true
                  }
                }
              })
              let awin = aboutWindow.window
              awin.once('ready-to-show', () => {
                aboutWindow.show()
              })
              let aboutUrl = process.env.PROD
                ? `file://${__dirname}/about.html`
                : `http://localhost:8080/about.html`
              aboutWindow.load(aboutUrl)
            }
          }
        ]
      })
    }

    var osxMenu = Menu.buildFromTemplate(appMenu)
    Menu.setApplicationMenu(osxMenu)

    this.mwin.webContents.removeAllListeners('context-menu')
    this.mwin.webContents.on('context-menu', (e, props) => {
      const { selectionText, isEditable } = props
      if (isEditable) {
        inputMenu.popup(this.mwin)
      } else if (selectionText && selectionText.trim() !== '') {
        selectionMenu.popup(this.mwin)
      }
    })
  }
}

export default OzoneMenu
