import _ from 'lodash'
import log4js from 'log4js'
import settings from './settings'

const LoggerFactory = {}

/**
 * Setup logging system.
 * @param  {Object} [options]
 * @param  {String} [options.loglevel] Minimum logging threshold (default: info).
 * @param  {String} [options.logfile] File to write logs to (default: no file logging).
 */
LoggerFactory.setup = (options) => {
  options = _.extend({
    logfile: null,
    loglevel: null
  }, options)

  // logging
  const log4jsOptions = {
    appenders: {
      console: { type: 'console' },
      file: { type: 'file', filename: settings.appDataPath + '.log' }
    },
    categories: {
      default: { appenders: ['console', 'file'], level: 'debug' }
    }
  }

  if (options.logfile) {
    log4jsOptions.appenders.push(
      {
        type: 'file',
        filename: options.logfile
      }
    )
  }

  log4js.configure(log4jsOptions)
}

LoggerFactory.create = (category) => {
  const logger = log4js.getLogger(category)

  // Allow for easy creation of sub-categories.
  logger.create = (subCategory) => {
    return exports.create(`${category}/${subCategory}`)
  }

  return logger
}

export default LoggerFactory
