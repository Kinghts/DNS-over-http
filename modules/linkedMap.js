const Node = require('./node')
const LinkedList = require('./linkedList')

function LinkedMap () {
  this.linkedList = new LinkedList()
  this.map = new Map()
}

LinkedMap.prototype.has = function (key) {
  return this.map.has(key)
}

LinkedMap.prototype.set = function (key, value) {
  if (this.has(key)) {
    this.map.set(key, value)
  } else {
    this.push(key, value)
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
  this.linkedList.insertAfter(new Node(key, value), this.linkedList.head.prior)
}

LinkedMap.prototype.pop = function () {
  let node = this.linkedList.deleteNode(this.linkedList.head.prior)
  if (node) {
    return node.value
  }
}

LinkedMap.prototype.unshift = function (key, value) {
  if (this.has(key)) {
    throw 'repeat key'
  }
  this.linkedList.insertAfter(new Node(key, value), this.linkedList.head)
}

/**
 * 将匹配的Node移到表头
 */
LinkedMap.prototype.moveToHead = function (key) {
  if (this.length > 1) {
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
