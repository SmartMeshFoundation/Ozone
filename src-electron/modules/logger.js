import log4js from 'log4js'
import path from 'path'
import { app } from 'electron'
import _ from 'lodash'

const LoggerFactory = {}

/**
 * Setup logging system.
 * @param  {Object} [options]
 * @param  {String} [options.loglevel] Minimum logging threshold (default: info).
 * @param  {String} [options.logfile] File to write logs to (default: no file logging).
 */
LoggerFactory.setup = options => {
  const log4jsOptions = {
    appenders: {
      console: { type: 'console' },
      file: {
        type: 'file',
        filename: path.resolve(app.getPath('userData'), 'ozone.log')
      }
    },
    categories: {
      default: {
        appenders: ['console', 'file'],
        level: process.env.PROD ? 'info' : 'debug'
      }
    }
  }

  log4js.configure(_.extend(log4jsOptions, options))
}

LoggerFactory.create = category => {
  const logger = log4js.getLogger(category)

  // Allow for easy creation of sub-categories.
  logger.create = subCategory => {
    return LoggerFactory.create(`${category}/${subCategory}`)
  }

  return logger
}

LoggerFactory.setup({})

export default LoggerFactory
