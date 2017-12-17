const path = require('path')
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

let w_udpServer = cp.fork(path.resolve(__dirname, './modules/worker/udpServer.js'))
let w_dnsHandler = cp.fork(path.resolve(__dirname, './modules/worker/dnsHandler.js'))

w_udpServer.on('message', function (msg) {
	var m = msg.msg
	switch (msg.type) {
		case msgType.info:
			// appLog.info(m)
			break
		case msgType.error:
			errLog.error(m)
			break
		case msgType.recBuf:
			w_dnsHandler.send(msg)
			break
	}
})
w_dnsHandler.on('message', function (msg) {
	var m = msg.msg
	switch (msg.type) {
		case msgType.info:
			// appLog.info('dnsHandler: ' + m)
			break
		case msgType.error:
			errLog.error('dnsHandler: ' + m)
			break
		case msgType.sendBuf:
			w_udpServer.send(msg)
			break
		case msgType.query:
			Object.assign(m, Query.prototype)
			getRecord(m)
			w_dnsHandler.send({ type: msgType.answer, msg: m })
			break
		case msgType.update:
			console.log('update: ' + m)
			break
	}
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
						break
					}
			}
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

process.on('SIGINT', () => {
	clearInterval(interv)
	process.exit()
})

process.on('exit', function () {
	w_udpServer.kill('SIGTERM')
	w_dnsHandler.kill('SIGTERM')
	console.log('main process exit')
})
