const fs = require('fs')
const path = require('path')
const cacheDir = './cache/'
Date.prototype.Format = require('./dateFormat').format
const config = require('../config/server.config')

function Cache () {

  this.records = {
    'A': null // Map
  }
}

Cache.prototype.readCacheFile = function () {
  let promises = []
  for (let type in this.records) {
    promises.push(new Promise((resolve, reject) => {
      let filePath = cacheDir + type + '.json'
      fs.exists(filePath, (exists) => {
        if (exists) {
          fs.readFile(filePath, (err, data) => {
            if (err) {
              reject(err)
            }
            let fileString = data.toString('utf-8')
            if (fileString.match(/^\s*$/g)) { // 文件内容为空
              this.records[type] = new Map()
            }
            this.records[type] = new Map(JSON.parse(fileString))
            resolve()
          })
        } else {
          this.records[type] = new Map()
          resolve()
        }
      })
    }))
  }
  return Promise.all(promises)
}

Cache.prototype.writeCacheToFile = function () {
  let promises = []
  for (let type in this.records) {
    promises.push(new Promise((resolve, reject) => {
      fs.writeFile(cacheDir + type + '.json', JSON.stringify([...this.records[type]]), (err) => {
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
  let record = this.records[type].get(domain)
  if (record) {
    if ((new Date() - new Date(record.updateTime)) > config.catchControl.time) {
      this.records[type].delete(domain)
      return
    }
  }
  return record
}

Cache.prototype.updateCache = function (type, domain, result) {
  let records = this.records[type]
  records.set(domain, {
    'result': result,
    'updateTime': new Date().Format('yyyy-MM-dd hh:mm:ss')
  })
  if (records.size > config.catchControl.maxNumber) {
    records.delete(records.keys().next().value)
  }
}

module.exports = {
  Cache
}
