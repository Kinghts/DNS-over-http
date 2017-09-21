module.exports = {
  appenders: {
    out: { type: 'console' },
    access: { 
      type: 'dateFile', 
      filename: 'log/access.log'
    },
    app: {
      type: 'dateFile',
      filename: 'log/app.log'
    },
    error: {
      type: 'dateFile',
      filename: 'log/error.log'
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