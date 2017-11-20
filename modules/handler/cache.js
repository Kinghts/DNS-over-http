const fs = require('fs')
const path = require('path')
const config = require('../../config/config.js')
const serverConfig = require(path.resolve(config.configFilePath, 'server.config.js'))
const cacheDir = serverConfig.catchControl.cacheFileDir
const LRU = require('../lru.js')
const httpHandler = new (require('./http'))

Date.prototype.Format = require('../dateFormat').format

function Cache () {
  this.sync = true
  this.records = {
    'A': null // LRU
  }
}

Cache.prototype.readCacheFile = function () {
  let promises = []
  for (let type in this.records) {
    promises.push(new Promise((resolve, reject) => {
      let filePath = path.resolve(cacheDir, type + '.json')
      fs.exists(filePath, (exists) => {
        if (exists) {
          fs.readFile(filePath, (err, data) => {
            if (err) {
              reject(err)
            }
            let fileString = data.toString('utf-8')
            if (fileString.match(/^\s*$/g)) { // 文件内容为空
              this.records[type] = new LRU(serverConfig.catchControl.maxNumber)
            } else {
              this.records[type] = new LRU(serverConfig.catchControl.maxNumber, JSON.parse(fileString))              
            }
            resolve()
          })
        } else {
          this.records[type] = new LRU(serverConfig.catchControl.maxNumber)
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
          fs.writeFile(path.resolve(cacheDir, type + '.json'), JSON.stringify([...map]), (err) => {
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

Cache.prototype.getResult = function (domain, type) {
  if (!type) {
    type = 'A'
  }
  let record = this.records[type].getElement(domain)
  if (record) {
    if ((new Date() - new Date(record.updateTime)) <= serverConfig.catchControl.time) {
      return record.result
    }
  }
}

Cache.prototype.updateCache = function (type, domain, result) {
  let records = this.records[type]
  records.addElement(domain, {
    'result': result,
    'updateTime': new Date().Format('yyyy-MM-dd hh:mm:ss')
  })
}

module.exports = Cache
