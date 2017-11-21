const path = require('path')
const config = require('../../config/base.config.js')
const block = require(path.resolve(config.configFilePath, 'block.config.js'))

function Block () {
  this.sync = true
  this.redirect = block.redirect
  this.blockUrl = new Set()
  this.blockRegex = [] // 用于屏蔽子域名的正则

  block.list.forEach(function(e) {
    if (!e || !e.url) {
      throw 'wrong config, please check block.config.js'
    } 
    if (e.blockAll) {
      this.blockRegex.push(RegExp('.*' + e.url.replace(/\./g, '\\.').toLowerCase() + '$', 'g'))
    } else {
      this.blockUrl.add(e.url)
    }
  }, this)
}

Block.prototype.getResult = function (domain) {
  let _this = this
  if (_this.blockUrl.has(domain)) {
    return _this.redirect
  }
  for (let reg of _this.blockRegex) {
    reg.lastIndex = 0
    if (reg.test(domain)) {
      return _this.redirect
    }
  }
}

module.exports = Block
