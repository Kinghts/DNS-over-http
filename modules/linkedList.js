const Node = require('./node')

function LinkedList () {
  this.head = new Node() // head的值永远为空
  this.head.prior = this.head
  this.head.next = this.head
  this.length = 0
}

LinkedList.prototype.insertAfter = function (snode, node) {
  if (node) {
    snode.next = node.next
    node.next.prior = snode
    node.next = snode
    snode.prior = node
    this.length++
  }
}

LinkedList.prototype.deleteNode = function (node) {
  if (node && node !== this.head && this.length > 0) {
    node.prior.next = node.next
    node.next.prior = node.prior
    node.prior = null
    node.next = null
    this.length--
    return node
  }
}

module.exports = LinkedList
