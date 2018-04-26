import _ from 'lodash'
import { app, BrowserWindow, ipcMain as ipc } from 'electron'
import Settings from './settings'
import logger from './logger'
import { EventEmitter } from 'events'

const log = logger.create('Windows')

class Window extends EventEmitter {
  constructor (mgr, type, opts) {
    super()

    opts = opts || {}

    this._mgr = mgr
    this._log = log.create(type)
    this.isPrimary = !!opts.primary
    this.type = type
    this.isPopup = !!opts.isPopup
    this.ownerId = opts.ownerId // the window which creates this new window

    let electronOptions = {
      title: Settings.appName,
      show: false,
      width: 1100,
      height: 720,
      icon: global.icon,
      titleBarStyle: 'hiddenInset',
      backgroundColor: '#F6F6F6',
      acceptFirstMouse: true,
      darkTheme: true,
      webPreferences: {
        nodeIntegration: false,
        webaudio: true,
        webgl: false,
        webSecurity: false, // necessary to make routing work on file:// protocol for assets in windows and popups. Not webviews!
        textAreasAreResizable: true
      }
    }

    electronOptions = _.extend(electronOptions, opts.electronOptions)

    this._log.debug('Creating browser window')

    this.window = new BrowserWindow(electronOptions)

    // set Accept_Language header
    // this.session = this.window.webContents.session
    // this.session.setUserAgent(this.session.getUserAgent(), Settings.language)

    this.webContents = this.window.webContents

    this.webContents.once('did-finish-load', () => {
      this.isContentReady = true

      this._log.debug(`Content loaded, id: ${this.id}`)

      if (opts.sendData) {
        if (_.isString(opts.sendData)) {
          this.send(opts.sendData)
        } else if (_.isObject(opts.sendData)) {
          for (const key in opts.sendData) {
            if ({}.hasOwnProperty.call(opts.sendData, key)) {
              this.send(key, opts.sendData[key])
            }
          }
        }
      }

      if (opts.show) {
        this.show()
      }

      this.emit('ready')
    })

    // prevent droping files
    this.webContents.on('will-navigate', e => {
      e.preventDefault()
    })

    this.window.once('closed', () => {
      this._log.debug('Closed')

      this.isShown = false
      this.isClosed = true
      this.isContentReady = false

      this.emit('closed')
    })

    this.window.on('show', e => {
      this.emit('show', e)
    })

    this.window.on('hide', e => {
      this.emit('hide', e)
    })

    if (opts.url) {
      this.load(opts.url)
    }
  }

  load (url) {
    if (this.isClosed) {
      return
    }

    this._log.debug(`Load URL: ${url}`)

    this.window.loadURL(url)
  }

  send () {
    if (this.isClosed || !this.isContentReady) {
      return
    }

    this._log.trace('Sending data', arguments)

    this.webContents.send.apply(this.webContents, arguments)
  }

  hide () {
    if (this.isClosed) {
      return
    }

    this._log.debug('Hide')

    this.window.hide()

    this.isShown = false
  }

  show () {
    if (this.isClosed) {
      return
    }

    this._log.debug('Show')

    this.window.show()

    this.isShown = true
  }

  close () {
    if (this.isClosed) {
      return
    }

    this._log.debug('Close')

    this.window.close()
  }
}

class Windows {
  constructor () {
    this._windows = {}
  }

  init () {
    // when a window gets initalized it will send us its id
    ipc.on('backendAction_setWindowId', event => {
      const id = event.sender.id

      log.debug('Set window id', id)

      const bwnd = BrowserWindow.fromWebContents(event.sender)
      const wnd = _.find(this._windows, w => {
        return w.window === bwnd
      })

      if (wnd) {
        log.trace(`Set window id=${id}, type=${wnd.type}`)

        wnd.id = id
      }
    })
  }

  create (type, options, callback) {
    options = options || {}

    const existing = this.getByType(type)

    if (existing && existing.ownerId === options.ownerId) {
      log.debug(
        `Window ${type} with owner ${options.ownerId} already existing.`
      )

      return existing
    }

    const category = options.primary ? 'primary' : 'secondary'

    log.info(
      `Create ${category} window: ${type}, owner: ${options.ownerId ||
        'notset'}`
    )

    const wnd = (this._windows[type] = new Window(this, type, options))
    wnd.on('closed', this._onWindowClosed.bind(this, wnd))

    if (callback) {
      wnd.callback = callback
    }

    return wnd
  }

  getByType (type) {
    log.trace('Get by type', type)

    return _.find(this._windows, w => {
      return w.type === type
    })
  }

  getById (id) {
    log.trace('Get by id', id)

    return _.find(this._windows, w => {
      return w.id === id
    })
  }

  broadcast () {
    const data = arguments

    log.trace('Broadcast', data)

    _.each(this._windows, wnd => {
      wnd.send(...data)
    })
  }

  /**
   * Handle a window being closed.
   *
   * This will remove the window from the internal list.
   *
   * This also checks to see if any primary windows are still visible
   * (even if hidden). If none found then it quits the app.
   *
   * @param {Window} wnd
   */
  _onWindowClosed (wnd) {
    log.debug(`Removing window from list: ${wnd.type}`)

    for (const t in this._windows) {
      if (this._windows[t] === wnd) {
        delete this._windows[t]

        break
      }
    }

    const anyOpen = _.find(this._windows, wnd => {
      return wnd.isPrimary && !wnd.isClosed && wnd.isShown
    })

    if (!anyOpen) {
      log.info('All primary windows closed/invisible, so quitting app...')

      app.quit()
    }
  }
}

export default new Windows()
