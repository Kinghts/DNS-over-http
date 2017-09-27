module.exports = {
  appenders: {
    out: { type: 'console' },
    app: {
      type: 'dateFile',
      filename: 'log/app',
      pattern: '.log',
      alwaysIncludePattern: true
    },
    error: {
      type: 'dateFile',
      filename: 'log/error',
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