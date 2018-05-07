import { Menu } from 'electron'

/** for context menus */
const selectionMenu = Menu.buildFromTemplate([
  { role: 'copy' },
  { type: 'separator' },
  { role: 'selectall' }
])

const inputMenu = Menu.buildFromTemplate([
  { role: 'undo' },
  { role: 'redo' },
  { type: 'separator' },
  { role: 'cut' },
  { role: 'copy' },
  { role: 'paste' },
  { type: 'separator' },
  { role: 'selectall' }
])
/** for context menus */

class Menus {
  init (bWindow) {
    bWindow.webContents.on('context-menu', (e, props) => {
      const { selectionText, isEditable } = props
      if (isEditable) {
        inputMenu.popup(bWindow)
      } else if (selectionText && selectionText.trim() !== '') {
        selectionMenu.popup(bWindow)
      }
    })
  }
}

export default new Menus()
