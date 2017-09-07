const http = require('http')

function dnsQueryByHTTP(domain) {
  const options = {
    hostname: '119.29.29.29',
    port: 80,
    path: '/d?dn=' + domain + '.',
    method: 'GET'
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
