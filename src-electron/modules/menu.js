import { Menu, app } from 'electron'
import i18n from 'i18next'
import zh from './i18n/ozone.zh.i18n.json'
import en from './i18n/ozone.en.i18n.json'
import { Types } from '../modules/ipc/types'
import path from 'path'
import fs from 'fs'

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
  }

  create () {
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

    const debugSubmenus = [
      {
        label: global.i18n.t('debugMenu.log'),
        click: () => {
          console.log('查看日志')
          let filename = path.resolve(app.getPath('userData'), 'ozone.log')
          fs.writeFileSync(path.resolve(app.getPath('desktop'), 'ozone.log'), fs.readFileSync(filename))
          global.windows.broadcast(Types.OZONE_LOG_DOWNLOADED)
        }
      }
    ]

    const appMenu = [
      {
        label: global.i18n.t('appMenu.edit'),
        submenu: editSubmenus
      },
      {
        label: global.i18n.t('appMenu.view'),
        submenu: [
          {
            label: global.i18n.t('appMenu.language-switch'),
            submenu: languageMenu
          }
        ]
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
        label: global.i18n.t('appMenu.file'),
        submenu: [
          {
            role: 'quit',
            label: global.i18n.t('appMenu.quit') + ' ' + app.getName()
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
