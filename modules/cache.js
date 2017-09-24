const fs = require('fs')
const path = require('path')
const cacheDir = './cache/'
Date.prototype.Format = require('./dateFormat').format
const config = require('../config/server.config')
const LRU = require('./lru.js')

function Cache () {
  this.records = {
    'A': null // LRU
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
              this.records[type] = new LRU(config.catchControl.maxNumber)
            }
            this.records[type] = new LRU(config.catchControl.maxNumber, JSON.parse(fileString))
            resolve()
          })
        } else {
          this.records[type] = new LRU(config.catchControl.maxNumber)
          resolve()
        }
      })
    }))
  }
  return Promise.all(promises)
}

Cache.prototype.writeCacheToFile = function () {
  return new Promise((resolve, reject) => {
    new Promise((reso, reje) => {
      fs.exists(cacheDir, (exists) => {
        if (!exists) {
          fs.mkdir(cacheDir, (err) => {
            if (err) {
              reje(err)
            }
            reso()
          })
        } else {
          reso()
        }
      })
    }).then(() => {
      let promises = []
      for (let type in this.records) {
        promises.push(new Promise((res, rej) => {
          let map = this.records[type].toMap()
          fs.writeFile(cacheDir + type + '.json', JSON.stringify([...map]), (err) => {
            if (err) {
              rej(err)
            }
            res()
          })
        }))
      }
      resolve(Promise.all(promises))
    }).catch(err => {
      reject(err)
    })
  })
}

Cache.prototype.getResult = function (type, domain) {
  let record = this.records[type].getElement(domain)
  if (record) {
    if ((new Date() - new Date(record.updateTime)) > config.catchControl.time) {
      return
    }
  }
  return record
}

Cache.prototype.updateCache = function (type, domain, result) {
  let records = this.records[type]
  records.addElement(domain, {
    'result': result,
    'updateTime': new Date().Format('yyyy-MM-dd hh:mm:ss')
  })
}

module.exports = {
  Cache
}
