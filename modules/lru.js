/**
 * LRU缓存算法的一种实现
 */
function LRU (maxLength, initData) {
  if (initData) {
    if (initData.length > maxLength) {
      throw 'LRU\'s init data length must smaller or equal to max length' 
    }
    this.map = new Map(initData)
    this.list = []
    initData.forEach(element => {
      this.list.push(element[0])
    })
  } else {
    this.map = new Map()
    this.list = []
  }
  this.length = maxLength
  
  // 命中缓存
  this._hit = (key) => {
    let _list = this.list
    _list.splice(_list.indexOf(key),1)
    _list.unshift(key)
  }
}

/**
 * 新加入元素
 */
LRU.prototype.addElement = function (key, value) {
  let _map = this.map
  let _list = this.list
  if (_map.has(key)) { // 重复的key
    _map.set(key, value)
    this._hit(key)
    _list[0] = value  
  } else {
    _map.set(key, value)
    _list.unshift(key)
    if (_list.length > this.length) {
      _map.delete(_list.pop())
    }
  }
}

/**
 * 获取指定元素
 */
LRU.prototype.getElement = function (key) {
  let element = this.map.get(key)
  if (element) {
    this._hit(key)
  }
  return element
}

module.exports = LRU
