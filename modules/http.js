const http = require('http')
const config = require('../config/server.config')

function dnsQueryByHTTP(domain) {
  const options = {
    hostname: config.httpServer.hostname,
    port: config.httpServer.port,
    path: config.httpServer.path(domain),
    method: config.httpServer.method
  }
  return new Promise(function (resolve, reject) {
    let req = http.request(options, (res) => {
      // console.log('STATUS: ' + res.statusCode)
      // console.log('HEADERS: ' + JSON.stringify(res.headers))
      res.setEncoding('utf8')
      res.on('data', function (chunk) {
        resolve(chunk)
      })
    })
    req.on('error', function (err) {
      reject(err)
    })
    req.end()
  })
}

module.exports = {
  dnsQueryByHTTP
}
