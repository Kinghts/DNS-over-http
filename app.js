const config = require('./config/server.config')

const named = require('./lib')
let server = named.createServer()

const log4js = require('log4js')
log4js.configure({
	appenders: { cheese: { type: 'file', filename: './log/running.log' } },
	categories: { default: { appenders: ['cheese'], level: 'error' } }
})
const errLogger = log4js.getLogger()
const devLogger = log4js.getLogger()
errLogger.level = 'error'
devLogger.level = 'info'

const dnsQueryByHTTP = require('./modules/http').dnsQueryByHTTP
const cache = new (require('./modules/cache').Cache)()
cache.readCacheFile()
	.then(() => {
		start()
	})
	.catch((err) => {
		errLogger.error(err)
	})

function start() {
	server.listen(config.localServer.port, config.localServer.address, function () {
		console.log('DNS server started on port 53');
	})

	server.on('query', function (query) {
		var domain = query.name()
		var type = query.type()
		devLogger.info('domain: %s; type: %s', domain, type)
		switch (type) {
			case 'A': // ipv4
				let cacheResult = cache.getResult(type, domain)
				if (cacheResult) {
					query.addAnswer(domain, new named.ARecord(cacheResult.result), 300)
					server.send(query)
					break
				}
				dnsQueryByHTTP(domain)
					.then((ip) => {
						if (ip) {
							ip = ip.split(';')[0]
						} else {
							throw 'no DNS result'
						}
						cache.updateCache(type, domain, ip)
						query.addAnswer(domain, new named.ARecord(ip), 300)
						server.send(query)
					})
					.catch(err => {
						errLogger.error(err)
						server.send(query)
					})
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
		errLogger.error("there was a clientError: %s", error)
	})

	server.on('uncaughtException', function (error) {
		errLogger.error("there was an excepton: %s", error.message || error.message())
	})
}

process.on('SIGINT', () => {
	cache.writeCacheToFile()
		.then(() => {
			server.close(() => {
				console.log('server closed')
				process.exit()
			})
		})
		.catch((err) => {
			errLogger.error(err)
			process.exit(1)
		})
})
