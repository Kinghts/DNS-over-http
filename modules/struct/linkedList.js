const Node = require('./node')

function LinkedList () {
  this.head = new Node() // head的值永远为空
  this.head.prior = this.head
  this.head.next = this.head
  this.length = 0
}

LinkedList.prototype.insertAfter = function (snode, node) {
  if (node && snode) {
    snode.next = node.next
    node.next.prior = snode
    node.next = snode
    snode.prior = node
    this.length++
  } else {
    throw 'snode and node shouldn\'t be empty'
  }
}

LinkedList.prototype.deleteNode = function (node) {
  let _this = this
  if (node && node !== _this.head && _this.length > 0) {
    node.prior.next = node.next
    node.next.prior = node.prior
    node.prior = null
    node.next = null
    _this.length--
    return node
  }
}

LinkedList.prototype.print = function () {
  let node = this.head.next,n = 0
  while(node !== this.head) {
    console.log(n + ': ' + node.key)
    node = node.next
    n++
  }
  console.log('----------------------------------')
}

module.exports = LinkedList
