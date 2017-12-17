/**
 * 接收和发送udp数据包的子进程
 */
const serverConfig = require('../../config/server.config')
const dgram = require('dgram')
const msgType = require('../util/msgType')

const Query = require('../../lib/query')
const DnsError = require('../../lib/errors')
const ExceptionError = DnsError.ExceptionError
const ProtocolError = DnsError.ProtocolError

let address = serverConfig.localServer.address
let port = serverConfig.localServer.port

if (!port)
  throw new TypeError('port (number) is required');

let defaultIP = '::0'
let udpType = 'udp6'
let match = address.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/)
if (match) {
  if (match[1] <= 255 && match[2] <= 255 && match[3] <= 255 && match[4] <= 255) {
    defaultIP = '127.0.0.1'
    udpType = 'udp4'
  }
}

if (typeof (address) === 'function' || !address) {
  callback = address
  address = defaultIP
}

let socket = dgram.createSocket(udpType)

socket.once('listening', function () {
  process.send({ type: msgType.info, msg: 'udp socket listen on 53' })
})

socket.on('close', function () {
  process.send({ type: msgType.info, msg: 'udp socket closed' })
})

socket.on('error', function (err) {
  process.send({ type: msgType.error, msg: err })
})

socket.on('message', function (buffer, rinfo) {
  process.send({ type: msgType.recBuf, msg:{ buffer: buffer, rinfo: rinfo }})
})

socket.bind(port, address)

process.on('message', function (msg) {
  switch (msg.type) {
    case msgType.sendBuf:
      var m = msg.msg
      send(new Buffer(m.buf.data), m.len, m.port, m.addr)
      break
    case msgType.cmd:
      if (msg.msg === 'exit') {
        exit()
      }
      break
  }
})

process.on('SIGTERM', function () {
  exit()
})

function send (buf, len, port, addr) {
  socket.send(buf, 0, len, port, addr, function (err, bytes) {
    if (err) {
      process.send({ type: msgType.error, msg: 'address: ' + addr + ' port: '+ port + '||' + err.message })
    } else {
      // process.send({ type: msgType.info, msg: 'send: udp response sent' })
    }
  })
}

function exit () {
  process.disconnect()
  socket.close((err) => {
    process.exit()
  })
}
