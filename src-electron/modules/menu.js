import {
  Menu,
  app,
  Tray,
  shell,
  BrowserWindow
} from 'electron'
import i18n from 'i18next'
import zh from './i18n/ozone.zh.i18n.json'
import en from './i18n/ozone.en.i18n.json'
import { Types } from '../modules/ipc/types'
import path from 'path'
import fs from 'fs'
import settings from './settings'
import Windows from './windows'

import nodeSync from '../modules/nodeSync'
import logger from '../modules/logger'
import _ from 'lodash'

import { EventEmitter } from 'events'

const log = logger.create('Menu')

const resources = {
  dev: { translation: zh },
  en: { translation: en },
  zh: { translation: zh }
}

class OzoneMenu extends EventEmitter {
  constructor (mwin) {
    super()
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

    if (settings.language) {
      lan = settings.language
    } else {
      settings.language = lan
    }

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

  create (hide) {
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

    const currentLanguage = settings.language

    const languageSubMenus = Object.keys(global.i18n.options.resources)
      .filter(langCode => langCode !== 'dev')
      .map(langCode => {
        const menuItem = {
          label: global.i18n.t(`appMenu.langCodes.${langCode}`),
          type: 'checkbox',
          checked: langCode === currentLanguage,
          click: () => {
            settings.language = langCode
            this.mwin.webContents.send(Types.SWITCH_LAN, langCode)
            global.language = langCode
            global.i18n.changeLanguage(langCode)
            this.create()
          }
        }
        return menuItem
      })

    const debugSubmenus = [
      {
        label: global.i18n.t('debugMenu.loginLock'),
        click: () => {
          global.windows.broadcast(Types.LOGIN_LOCK_SETTING)
        }
      }
    ]

    if (process.platform === 'win32') {
      if (this.tray) {
        this.tray.destroy()
      }
      this.tray = new Tray(path.join(global.__statics, 'tray.ico'))
      this.mwin.on('close', (event) => {
        this.mwin.hide()
        this.mwin.setSkipTaskbar(true)
        event.preventDefault()
      })
      this.mwin.on('show', () => {
        this.tray.setHighlightMode('always')
      })
      this.mwin.on('hide', () => {
        if (nodeSync.finished) {
          this.mwin.send(Types.HIDE_WINDOW)
        }
        this.tray.setHighlightMode('never')
      })
      const contextMenu = Menu.buildFromTemplate([
        {label: global.i18n.t('tray.open'),
          click: () => {
            if (this.mwin.isVisible()) {
              if (this.mwin.isMinimized()) {
                this.mwin.show()
              }
            } else {
              this.mwin.show()
            }
            this.mwin.isVisible() ? this.mwin.setSkipTaskbar(false) : this.mwin.setSkipTaskbar(true)
          }},
        {label: global.i18n.t('tray.close'), click: () => { this.mwin.destroy() }}
      ])
      this.tray.setToolTip('Ozone')
      this.tray.setContextMenu(contextMenu)
      this.tray.on('click', () => {
        if (this.mwin.isVisible()) {
          if (this.mwin.isMinimized()) {
            this.mwin.show()
          }
        } else {
          this.mwin.show()
        }
        this.mwin.isVisible() ? this.mwin.setSkipTaskbar(false) : this.mwin.setSkipTaskbar(true)
      })
    }

    const appMenu = []

    if (!hide) {
      appMenu.push({
        label: global.i18n.t('appMenu.language-switch'),
        submenu: languageSubMenus
      })
      appMenu.push({
        label: global.i18n.t('appMenu.debug'),
        submenu: debugSubmenus
      })
    }

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
              awin.setMenu(null)
              let aboutUrl = process.env.PROD
                ? `file://${__dirname}/about.html`
                : `http://localhost:8080/about.html`
              aboutWindow.load(aboutUrl)
            }
          }
        ]
      })
    }

    const devSubMenus = [
      {
        label: global.i18n.t('devMenu.net.label'),
        submenu: [
          {
            id: 'mainNet',
            label: global.i18n.t('devMenu.net.main'),
            type: 'checkbox',
            checked: settings.network === 'main',
            click: () => {
              this.changeNetwork('main')
            }
          },
          {
            id: 'testNet',
            label: global.i18n.t('devMenu.net.test'),
            type: 'checkbox',
            checked: settings.network === 'test',
            click: () => {
              this.changeNetwork('test')
            }
          },
          {
            id: 'devMode',
            label: global.i18n.t('devMenu.net.dev'),
            type: 'checkbox',
            checked: settings.network === 'dev',
            click: () => {
              this.changeNetwork('dev')
            }
          }
        ]
      },
      { type: 'separator' },
      {
        label: global.i18n.t('debugMenu.rmData'),
        click: () => {
          global.windows.broadcast(Types.MENU_ACTION_RMDATA)
        }
      },
      {
        label: global.i18n.t('debugMenu.log'),
        click: () => {
          let filename = path.resolve(app.getPath('userData'), 'ozone.log')
          fs.writeFileSync(path.resolve(app.getPath('desktop'), 'ozone.log'), fs.readFileSync(filename))
          global.windows.broadcast(Types.OZONE_LOG_DOWNLOADED)
        }
      },
      { type: 'separator' },
      {
        label: global.i18n.t('devMenu.remix'),
        click (menuItem, browserWindow, event) {
          shell.openExternal('https://remix.ethereum.org')
        }
      }
    ]

    if (process.env.DEV) {
      devSubMenus.push(
        {
          'label': global.i18n.t('devMenu.devtools'),
          accelerator: 'Alt+CommandOrControl+I',
          click () {
            const curWindow = BrowserWindow.getFocusedWindow()
            if (curWindow) {
              curWindow.toggleDevTools()
            }
          }
        }
      )
    }

    if (!hide) {
      appMenu.push({
        label: global.i18n.t('devMenu.label'),
        submenu: devSubMenus
      })
    }

    this.menu = Menu.buildFromTemplate(appMenu)
    Menu.setApplicationMenu(this.menu)

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

  changeNetwork (network) {
    if (settings.network !== network) {
      log.debug(`Change network from '${settings.network}' to '${network}'`)
      Windows.broadcast(Types.MENU_ACTION_CHANGE_NETWORK, network)
      /* if (process.env.DEV) {
        setTimeout(() => {
          app.quit()
        }, 3000)
      } else {
        setTimeout(() => {
          app.relaunch()
          app.quit()
        }, 3000)
      } */
    }
    this.create()
  }
}

export default OzoneMenu
