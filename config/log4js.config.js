module.exports = {
  appenders: {
    out: { type: 'console' },
    access: { 
      type: 'dateFile', 
      filename: 'log/access',
      pattern: '.log',
      alwaysIncludePattern: true
    },
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
      appenders: ['out', 'access'],
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