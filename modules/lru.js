const LinkedMap = require('./linkedMap')

/**
 * LRU缓存算法的一种实现
 */
function LRU (maxLength, initData) {
  this.maxLength = maxLength
  this.linkedMap = new LinkedMap()
  if (initData) {
    if (initData.length > maxLength) {
      throw 'LRU\'s init data length must smaller or equal to max length' 
    }
    initData.forEach(element => {
      this.linkedMap.set(element[0], element[1])
    })
  }
}

/**
 * 新加入元素
 */
LRU.prototype.addElement = function (key, value) {
  let _map = this.linkedMap
  _map.set(key, value)
  _map.moveToHead(key)
  if (_map.linkedList.length > this.maxLength) {
    _map.pop()
  }
}

/**
 * 获取指定元素
 */
LRU.prototype.getElement = function (key) {
  let element = this.linkedMap.get(key)
  if (element) {
    this.linkedMap.moveToHead(key)
  }
  return element
}

/**
 * 移除循环引用，并返回map对象
 */
LRU.prototype.toMap = function () {
  return this.linkedMap.toMap()
}

module.exports = LRU
