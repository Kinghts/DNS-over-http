/**
 * 需要block的域名可以在这里配置
 */
module.exports = {
  redirect: '127.0.0.1', // 被block的域名的解析结果
  list: [
    {
      url: 'test.com', // 要屏蔽子域名时，url请输入主域名，如test.com
      blockAll: true // 为true时会屏蔽所有子域名,如game.test.com
    },
    {
      url: 'wps.cn',
      blockAll: true
    },
    {
      url: 'wpscdn.cn',
      blockAll: true
    },
    {
      url: 'ksosoft.com',
      blockAll: true
    },
    {
      url: 'nsclick.baidu.com',
      blockAll: true
    },
    {
      url: 'eclick.baidu.com',
      blockAll: true
    },
    {
      url: 'hm.baidu.com',
      blockAll: true
    },
    {
      url: 'bdimg.share.baidu.com',
      blockAll: true
    },
    {
      url: 'pos.baidu.com',
      blockAll: true
    },
  ]
}
