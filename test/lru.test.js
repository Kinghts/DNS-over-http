import test from 'ava'
import LRU from '../modules/lru'

let lru = new LRU(100)

let urls = ['a','b','c','d','a','b']

lru.addElement('baidu.com', '123456')

test('getElement', t => {
  for (let i = 0; i < 10000; i++) {
    t.is(lru.getElement('baidu.com'), '123456')
  }
})
