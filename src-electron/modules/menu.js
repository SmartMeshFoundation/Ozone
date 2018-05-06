import { Menu } from 'electron'
import { Types } from '../modules/ipc/types'
class OzoneMenu {
  constructor (mwin) {
    this.mwin = mwin
  }

  create () {
    const selectionMenu = Menu.buildFromTemplate([
      { role: 'copy', label: global.i18n.t('selectionMenu.copy') },
      { type: 'separator' },
      { role: 'selectall', label: global.i18n.t('selectionMenu.selectall') }
    ])

    const inputMenu = Menu.buildFromTemplate([
      { role: 'undo', label: global.i18n.t('inputMenu.undo') },
      { role: 'redo', label: global.i18n.t('inputMenu.redo') },
      { type: 'separator' },
      { role: 'cut', label: global.i18n.t('inputMenu.cut') },
      { role: 'copy', label: global.i18n.t('inputMenu.copy') },
      { role: 'paste', label: global.i18n.t('inputMenu.paste') },
      { type: 'separator' },
      { role: 'selectall', label: global.i18n.t('inputMenu.selectall') }
    ])

    const currentLanguage = global.language

    const languageMenu = Object.keys(global.i18n.options.resources)
      .filter(langCode => langCode !== 'dev')
      .map(langCode => {
        const menuItem = {
          label: global.i18n.t(`appMenu.langCodes.${langCode}`),
          type: 'checkbox',
          checked: langCode === currentLanguage,
          click: () => {
            this.mwin.webContents.send(Types.SWICH_LAN, langCode)
            global.language = langCode
            global.i18n.changeLanguage(langCode)
            this.create()
          }
        }
        return menuItem
      })

    const appMenu = [{
      label: global.i18n.t('appMenu.view'),
      submenu: [
        {
          label: global.i18n.t('appMenu.language-swich'),
          submenu: languageMenu
        }
      ]
    }]

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
