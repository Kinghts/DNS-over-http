const path = require('path')

const logDir = path.resolve(__dirname, '../log') // 需要绝对路径

module.exports = {
  appenders: {
    out: { type: 'console' },
    app: {
      type: 'dateFile',
      filename: path.resolve(logDir, 'app'),
      pattern: '.log',
      alwaysIncludePattern: true
    },
    error: {
      type: 'dateFile',
      filename: path.resolve(logDir, 'error'),
      pattern: '.log',
      alwaysIncludePattern: true
    }
  },
  categories: {
    access: {
      appenders: ['out'],
      level: 'info'
    },
    app: {
      appenders: ['out', 'app'],
      level: 'info'
    },
    error: {
      appenders: ['out', 'error'],
      level: 'error'
    },
    default: {
      appenders: ['out'],
      level: 'info'
    }
  }
}