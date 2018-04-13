const log = require('electron-log')
const util = require('util')
const moment = require('moment')

log.transports.console = function (msg) {
  let text = util.format.apply(util, msg.data)
  let df = 'HH:mm:ss.SSS'
  console.log(`[${moment(msg.date).format(df)} ${msg.level}] - ${text}`)
}

// Log level
log.transports.console.level = 'debug'

log.transports.file.level = 'warn'
log.transports.file.appName = 'ozone'

export default log
