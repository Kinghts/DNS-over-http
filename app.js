const path = require('path')
const config = require('./config/base.config.js')
const serverConfig = require(path.resolve(config.configFilePath, 'server.config.js'))

const named = require('./lib')
let server = named.createServer()

const log4js = require('log4js')
log4js.configure(require(path.resolve(config.configFilePath, 'log4js.config.js')))
const appLog = log4js.getLogger('app')
const accessLog = log4js.getLogger('access')
const errLog = log4js.getLogger('error')

const blockHandler = new (require('./modules/handler/block'))()
const hostsHandler = new (require('./modules/handler/hosts'))()
const cacheHandler = new (require('./modules/handler/cache'))()
const httpHandler = new (require('./modules/handler/http'))()

const handlers = [blockHandler, hostsHandler, cacheHandler, httpHandler]

cacheHandler.readCacheFile()
	.then(() => {
		start()
	})
	.catch((err) => {
		errLog.error(err)
	})

function start() {
	server.listen(serverConfig.localServer.port, serverConfig.localServer.address, function () {
		appLog.info('DNS server started on port 53');
	})

	server.on('query', function (query) {
		var domain = query.name()
		var type = query.type()
		accessLog.info('domain: %s; type: %s', domain, type)
		switch (type) {
			case 'A': // ipv4
				let result
				for (let handler of handlers) {
					if (handler.sync) {
						result = handler.getResult(domain)
						if (result) {
							query.addAnswer(domain, new named.ARecord(result), 300)
							server.send(query)
							break
						}
					} else {
						handler.getResult(domain)
							.then(ip => {
								if (ip) {
									query.addAnswer(domain, new named.ARecord(ip), 300)
									cacheHandler.updateCache(type, domain, ip)
									server.send(query)
								} else {
									accessLog.info('domain: ' + domain + ' no answer')
									server.send(query)
								}
							})
							.catch(err => {
								errLog.error('domain: ' + domain + '\\r\\n' + err)
								server.send(query)
							})
					}
				}
				break
			case 'AAAA': // ipv6
				var record = new named.AAAARecord('::1')
				query.addAnswer(domain, record, 300)
				server.send(query)
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
				server.send(query)
				break
		}
	})

	server.on('clientError', function (error) {
		errLog.error("there was a clientError: %s", error)
	})

	server.on('uncaughtException', function (error) {
		errLog.error("there was an excepton: %s", error.message || error.message())
	})
}

process.on('SIGINT', () => {
	cacheHandler.writeCacheToFile()
		.then(() => {
			server.close(() => {
				appLog.info('server closed')
				process.exit()
			})
		})
		.catch((err) => {
			errLog.error(err)
			process.exit(1)
		})
})
