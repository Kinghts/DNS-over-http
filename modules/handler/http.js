let http = require('http')
const https = require('https')
const path = require('path')
const config = require('../../config/base.config.js')
const serverConfig = require(path.resolve(config.configFilePath, 'server.config.js'))

function Http () {
  this.sync = false
}

function h() {
  if (serverConfig.httpServer.https) {
    return https
  }
  return http
}

Http.prototype.getResult = function (domain) {
  return new Promise(function (resolve, reject) {
    let options = {
      hostname: serverConfig.httpServer.hostname,
      port: serverConfig.httpServer.port,
      path: serverConfig.httpServer.path(domain),
      method: serverConfig.httpServer.method
    }
    let req = h().request(options, (res) => {
      // console.log('STATUS: ' + res.statusCode)
      // console.log('HEADERS: ' + JSON.stringify(res.headers))
      res.setEncoding('utf8')
      res.on('data', function (chunk) {
        resolve(serverConfig.httpServer.resultHandler(chunk))
      })
    })
    req.on('error', function (err) {
      reject(err)
    })
    req.end()
  })
}

module.exports = Http
