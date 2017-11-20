const path = require('path')
const config = require('../../config/config.js')
const hosts = require(path.resolve(config.configFilePath, 'hosts.config.js'))

function Hosts () {
  this.sync = true
  this.hosts = new Map(hosts)
}

Hosts.prototype.getResult = function (domain) {
  return this.hosts.get(domain)
}

module.exports = Hosts
