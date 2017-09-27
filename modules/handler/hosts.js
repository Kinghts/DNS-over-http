const hosts = require('../../config/hosts.config')

function Hosts () {
  this.sync = true
  this.hosts = new Map(hosts)
}

Hosts.prototype.getResult = function (domain) {
  return this.hosts.get(domain)
}

module.exports = Hosts
