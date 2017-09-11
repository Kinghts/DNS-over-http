const fs = require('fs')
const path = require('path')
const cacheDir = './cache/'
Date.prototype.Format = require('./dateFormat').format

function Cache () {
  this.records = {
    'A': null
  }
}

Cache.prototype.readCacheFile = function () {
  let promises = []
  for (let type in this.records) {
    promises.push(new Promise((resolve, reject) => {
      fs.readFile(cacheDir + type + '.json', (err, data) => {
        if (err) {
          reject()
        }
        this.records[type] = JSON.parse(data.toString('utf-8'))
        resolve()
      })
    }))
  }
  return Promise.all(promises)
}

Cache.prototype.writeCacheToFile = function () {
  let promises = []
  for (let type in this.records) {
    promises.push(new Promise((resolve, reject) => {
      fs.writeFile(cacheDir + type + '.json', JSON.stringify(this.records[type]), (err) => {
        if (err) {
          reject()
        }
        resolve()
      })
    }))
  }
  return Promise.all(promises)
}

Cache.prototype.getResult = function (type, domain) {
  return this.records[type][domain]
}

Cache.prototype.updateCache = function (type, domain, result) {
  this.records[type][domain] = {
    'result': result,
    'updateTime': new Date().Format('yyyy-MM-dd hh:mm:ss')
  }
}

module.exports = {
  Cache
}
