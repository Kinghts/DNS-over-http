const Node = require('./node')
const LinkedList = require('./linkedList')

function LinkedMap () {
  this.linkedList = new LinkedList() // key,value
  this.map = new Map() // key-node
}

LinkedMap.prototype.has = function (key) {
  return this.map.has(key)
}

LinkedMap.prototype.set = function (key, value) {
  let _this = this
  if (_this.has(key)) {
    _this.map.get(key).value = value
  } else {
    let node = new Node(key, value)
    _this.map.set(key, node)
    _this.linkedList.insertAfter(node, _this.linkedList.head.prior)
  }
}

LinkedMap.prototype.get = function (key) {
  let node = this.map.get(key)
  if (node) {
    return node.value
  }
}

LinkedMap.prototype.pop = function () {
  let _this = this
  let node = _this.linkedList.deleteNode(_this.linkedList.head.prior)
  _this.map.delete(node.key)
  return node
}

/**
 * 将匹配的Node移到表头
 */
LinkedMap.prototype.moveToHead = function (key) {
  let _this = this
  if (_this.linkedList.length > 1) {
    let node = _this.map.get(key)
    _this.linkedList.deleteNode(node)
    _this.linkedList.insertAfter(node, _this.linkedList.head)
  }
}

/**
 * 返回无循环引用的map
 */
LinkedMap.prototype.toMap = function () {
  let map = new Map()
  let i = 0,iNode = this.linkedList.head.next
  while (i < this.linkedList.length) {
    map.set(iNode.key, iNode.value)
    iNode = iNode.next
    i++
  }
  return map
}

module.exports = LinkedMap
