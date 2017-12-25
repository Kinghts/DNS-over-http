const fs = require('fs')
const path = require('path')
const config = require('../../config/base.config.js')
const serverConfig = require(path.resolve(config.configFilePath, 'server.config.js'))
const cacheDir = serverConfig.cacheControl.cacheFileDir
const LRU = require('../lru.js')
const httpHandler = new (require('./http'))

Date.prototype.Format = require('../dateFormat').format

function Cache () {
  this.sync = true
  this.records = {
    'A': null // LRU
  }
}

Cache.prototype.readCacheFile = async function () {
  let promises = []
  for (let type in this.records) {
    promises.push(new Promise((resolve, reject) => {
      let filePath = path.resolve(cacheDir, type + '.json')
      fs.readFile(filePath, (err, data) => {
        if (err) {
          if (err.code === 'ENOENT') { // 缓存文件不存在
            this.records[type] = new LRU(serverConfig.cacheControl.maxNumber)
            resolve()
          } else {
            reject(err)
          }
          return
        }
        let fileString = data.toString('utf-8')
        if (fileString.match(/^\s*$/g)) { // 文件内容为空
          this.records[type] = new LRU(serverConfig.cacheControl.maxNumber)
        } else {
          this.records[type] = new LRU(serverConfig.cacheControl.maxNumber, JSON.parse(fileString))              
        }
        resolve()
      })
    }))
  }
  await Promise.all(promises)
}

Cache.prototype.writeCacheToFile = async function () {
  let createDir = await new Promise((resolve, reject) => {
    fs.stat(cacheDir, (err, stats) => {
      if (err) {
        if (err.code === 'ENOENT') { // cache文件夹不存在
          resolve(true)
        } else {
          reject(err)
        }
      } else {
        resolve()
      }
    })
  })
  if (createDir) {
    await new Promise((resolve, reject) => {
      fs.mkdir(cacheDir, (err) => {
        if (err) {
          reject(err)
        }
        resolve()
      })
    })
  }
  let promises = []
  for (let type in this.records) {
    promises.push(new Promise((resolve, reject) => {
      let map = this.records[type].toMap()
      fs.writeFile(path.resolve(cacheDir, type + '.json'), JSON.stringify([...map]), (err) => {
        if (err) {
          reject(err)
        }
        resolve()
      })
    }))
  }
  await Promise.all(promises) 
}

Cache.prototype.getResult = function (domain, type) {
  if (!type) {
    type = 'A'
  }
  let record = this.records[type].getElement(domain)
  if (record) {
    if ((new Date() - new Date(record.updateTime)) <= serverConfig.cacheControl.time) {
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
