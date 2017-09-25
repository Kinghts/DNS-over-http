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
  if (this.has(key)) {
    this.map.get(key).value = value
  } else {
    let node = new Node(key, value)
    this.map.set(key, node)
    this.linkedList.insertAfter(node, this.linkedList.head.prior)
  }
}

LinkedMap.prototype.get = function (key) {
  let node = this.map.get(key)
  if (node) {
    return node.value
  }
}

LinkedMap.prototype.pop = function () {
  return this.linkedList.deleteNode(this.linkedList.head.prior)
}

/**
 * 将匹配的Node移到表头
 */
LinkedMap.prototype.moveToHead = function (key) {
  if (this.linkedList.length > 1) {
    let node = this.map.get(key)
    this.linkedList.deleteNode(node)
    this.linkedList.insertAfter(node, this.linkedList.head)
  }
  console.log('head: ' + this.linkedList.head.next.key)
  console.log('length: ' + this.linkedList.length)
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
