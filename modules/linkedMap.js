function Node (key, value) {
  this.prior = null
  this.key = key
  this.value = value
  this.next = null
}

function LinkedMap () {
  this.head = null
  this.length = 0
  this.map = new Map()
  this._addHead = (key, value) => {
    this.head = new Node(key, value)
    this.head.prior = this.head
    this.head.next = this.head
  }
}

LinkedMap.prototype.has = function (key) {
  return this.map.has(key)
}

LinkedMap.prototype.set = function (key, value) {
  if (this.has(key)) {
    this.map.set(key, value)
  } else {
    this.push(key, value)
    this.length++
  }
}

LinkedMap.prototype.get = function (key) {
  let node = this.map.get(key)
  if (node) {
    return node.value
  }
}

LinkedMap.prototype.push = function (key, value) {
  if (this.has(key)) {
    throw 'repeat key'
  }
  if (this.length !== 0) {
    let node = new Node(key, value)
    let _head = this.head
    let _tail = _head.prior
    _tail.next = node
    node.prior = _tail
    node.next = _head
    _head.prior = node
    this.map.set(key, node)
  } else {
    this._addHead(key, value)
  }
  this.length++
}

LinkedMap.prototype.pop = function () {
  if (this.length === 0) {
    return
  }
  if (this.length > 1) {
    let _head = this.head
    let _tail = this.head.prior
    _head.prior = _tail.prior
    _tail.prior.next = _head
    _tail.next = null
    _tail.prior = null
    this.length--
    this.map.delete(_tail.key)
    return _tail.value
  }
  if (this.length === 1) {
    let _head = this.head
    _head.prior = null
    _head.next = null
    let value = _head.value
    this.head = null
    this.length = 0
    this.map.delete(key)
    return value
  }
}

LinkedMap.prototype.unshift = function (key, value) {
  if (this.has(key)) {
    throw 'repeat key'
  }
  if (this.length !== 0) {
    let _head = this.head
    let node = new Node(value)
    node.next = _head
    node.prior = _head.prior
    _head.prior.next = node
    _head.prior = node
    this.head = node
    this.map.set(key, node)
  } else {
    this._addHead(key, value)
    this.map.set(key, this.head)
  }
  this.length++
}

/**
 * 将匹配的Node移到表头
 */
LinkedMap.prototype.moveToHead = function (key) {
  if (this.length > 1) {
    let node = this.map.get(key)
    if (node === this.head) {
      return
    }
    if (node) {
      let _head = this.head
      node.prior.next = node.next
      node.next.prior = node.prior
      node.next = _head
      node.prior = _head.prior
      _head.prior.next = node
      _head.prior = node
      this.head = node
    }
  }
  console.log('head: ' + this.head.key)
  console.log('length: ' + this.length)
}

/**
 * 返回无循环引用的map
 */
LinkedMap.prototype.toMap = function () {
  let map = new Map()
  let i = 0,iNode = this.head
  while (i < this.length) {
    map.set(iNode.key, iNode.value)
    iNode = iNode.next
    i++
  }
  return map
}

module.exports = LinkedMap
