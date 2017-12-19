/**
 * 处理buffer和查询dns记录的子进程
 */
const assert = require('assert')
const msgType = require('../util/msgType')

const named = require('../../lib')
const Query = require('../../lib/query')
const DnsError = require('../../lib/errors')

const ExceptionError = DnsError.ExceptionError
const ProtocolError = DnsError.ProtocolError

const httpHandler = new (require('../handler/http'))

process.on('message', function (msg) {
  var m = msg.msg
  switch (msg.type) {
    case msgType.recBuf:
      sendQuery(new Buffer(m.buffer.data), m.rinfo)
      break
    case msgType.answer:
      Object.assign(m, Query.Query.prototype)
      if (m._anCount === 0) { // 没有从缓存查询到记录
        httpHandler.getResult(m.name())
          .then(ip => {
            if (ip) {
              m.addAnswer(m.name(), new named.ARecord(ip), 300)
              sendAnswer(m)
            }
          })
          .catch(err => {
            process.send({ type: msgType.error, msg: 'http query error: ' + err + 'domain: ' + m.name() })
          })
      } else {
        sendAnswer(m)
      }
      break
    case msgType.cmd:
      if (m === 'exit') {
        exit()
      }
      break
  }
})

function sendQuery(buffer, rinfo) {
  setImmediate(function () {
    var decoded
    var query
    var raw = {
      buf: buffer,
      len: rinfo.size
    }

    var src = {
      family: 'udp6',
      address: rinfo.address,
      port: rinfo.port
    }

    try {
      decoded = Query.parse(raw, src)
      query = Query.createQuery(decoded)
    } catch (e) {
      process.send({ type: msgType.error, msg: new ProtocolError('invalid DNS datagram') })
    }

    if (query === undefined || query === null) {
      return
    }

    process.send({ type: msgType.query, msg: query }) // query对象json化后会丢失function
  })
}

function sendAnswer(query) {
  setImmediate(function () {


    assert.ok(query)

    try {
      query._flags.qr = 1  // replace with function
      query.encode()
    } catch (e) {
      process.send({ type: msgType.error, msg: new ExceptionError('unable to encode response') })
    }

    var addr = query._client.address
    var buf = query._raw.buf
    var len = query._raw.len
    var port = query._client.port

    process.send({ type: msgType.sendBuf, msg: { buf: buf, len: len, port: port, addr: addr } })
  })
}

process.on('SIGTERM', function () {
  process.disconnect()
  process.exit()
})

process.on('uncaughtException', function (err) {
  //process.send({ type: msgType.error, msg: err })
})
