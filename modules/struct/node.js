function Node (key, value) {
  this.prior = null
  this.key = key
  this.value = value
  this.next = null
}

module.exports = Node
