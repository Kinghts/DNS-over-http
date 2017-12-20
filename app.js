const path = require('path')
const dgram = require('dgram')
const cp = require('child_process')
const config = require('./config/base.config.js')
const serverConfig = require(path.resolve(config.configFilePath, 'server.config.js'))
const msgType = require('./modules/util/msgType')

const named = require('./lib')
const { Query } = require('./lib/query')

const log4js = require('log4js')
log4js.configure(require(path.resolve(config.configFilePath, 'log4js.config.js')))
const appLog = log4js.getLogger('app')
const accessLog = log4js.getLogger('access')
const errLog = log4js.getLogger('error')

const blockHandler = new (require('./modules/handler/block'))()
const hostsHandler = new (require('./modules/handler/hosts'))()
const cacheHandler = new (require('./modules/handler/cache'))()

const handlers = [blockHandler, hostsHandler, cacheHandler]

cacheHandler.readCacheFile()
	.then(() => {
		//start()
		appLog.info('finished to read cache file')
	})
	.catch((err) => {
		errLog.error(err)
	})

// 缓存定时写入文件
const interv = setInterval(() => {
	cacheHandler.writeCacheToFile()
		.then(() => {
			appLog.info('save cache success')
		})
		.catch((err) => {
			errLog.error(err)
		})
}, serverConfig.cacheControl.interval)


let socket
(function initUDPServer() {
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

	socket = dgram.createSocket(udpType)

	socket.once('listening', function () {
		appLog.info('listen on 53')
	})

	socket.on('close', function () {

	})

	socket.on('error', function (err) {
		appLog.error(err)
	})

	socket.on('message', function (buffer, rinfo) {
		w_dnsHandlers[workerIndex()].send({ type: msgType.recBuf, msg: { buffer: buffer, rinfo: rinfo } })
	})

	socket.bind(port, address)
})()

let childNum = serverConfig.childProcess.num
let w_dnsHandlers = []
let index = -1
let workerIndex = function () {
	index++
	if (index >= childNum) {
		index = 0
	}
	return index
}
for (let i = 0; i < childNum; i++) {
	w_dnsHandlers.push(cp.fork(path.resolve(__dirname, './modules/worker/dnsHandler.js')))
}

w_dnsHandlers.map(function (worker) {
	worker.on('message', function (msg) {
		var m = msg.msg
		switch (msg.type) {
			case msgType.info:
				// appLog.info('dnsHandler: ' + m)
				break
			case msgType.error:
				errLog.error('dnsHandler: ' + m)
				break
			case msgType.sendBuf:
				send(new Buffer(m.buf.data), m.len, m.port, m.addr)
				break
			case msgType.query:
				Object.assign(m, Query.prototype)
				getRecord(m)
				this.send({ type: msgType.answer, msg: m })
				break
			case msgType.update:
				cacheHandler.updateCache(m.type, m.domain, m.result)
				break
		}
	})
})

function getRecord(query) {
		var domain = query.name()
		var type = query.type()
		//appLog.info('query: ' + domain + ' type: ' + type)
		switch (type) {
			case 'A': // ipv4
				let result
				for (let handler of handlers) {
					result = handler.getResult(domain)
					if (result) {
						query.addAnswer(domain, new named.ARecord(result), 300)
						return
					}
				}
				appLog.info('cache missed: ' + domain)
				break
			case 'AAAA': // ipv6
				var record = new named.AAAARecord('::1')
				query.addAnswer(domain, record, 300)
				break
			case 'CNAME':
				var record = new named.CNAMERecord('cname.example.com')
				query.addAnswer(domain, record, 300)
				break
			case 'MX':
				var record = new named.MXRecord('smtp.example.com')
				query.addAnswer(domain, record, 300)
				break
			case 'SOA':
				var record = new named.SOARecord('example.com')
				query.addAnswer(domain, record, 300)
				break
			case 'SRV':
				var record = new named.SRVRecord('sip.example.com', 5060)
				query.addAnswer(domain, record, 300)
				break
			case 'TXT':
				var record = new named.TXTRecord('hello world')
				query.addAnswer(domain, record, 300)
				break
			default:
				break
		}
}

function send(buf, len, port, addr) {
	socket.send(buf, 0, len, port, addr, function (err, bytes) {
		if (err) {
			appLog.error(err)
		}
	})
}

process.on('exit', function () {
	clearInterval(interv)
	socket.close((err) => {
		if (err) {
			appLog.error(err)
		}
		process.exit()
	})
	w_dnsHandlers.map(worker => {
		worker.kill('SIGTERM')
	})
	console.log('main process exit')
})

process.on('uncaughtException', (err) => {
	appLog.error(err)
})
