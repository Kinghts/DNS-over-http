module.exports = {
  // 提供http dns的服务器，默认使用dnspod的服务器
  httpServer: {
    hostname: '119.29.29.29',
    port: 80,
    path: domain => '/d?dn=' + domain + '.',
    method: 'GET',
    resultHandler: result => result.split(';')[0]
  },
  // 本地dns服务器配置
  localServer: {
    address: '127.0.0.1',
    port: 53
  },
  // 缓存策略
  catchControl: {
    time: 172800000, // 缓存记录保存时间，单位：毫秒
    maxNumber: 1000 // 每种记录的最大条数
  }
}