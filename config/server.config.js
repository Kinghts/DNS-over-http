const path = require('path')

const DNS = {
  cloudflare: {
    https: true,
    hostname: '1.1.1.1',
    port: 443,
    path: domain => `/dns-query?ct=application/dns-json&name=${domain}&type=A`,
    method: 'GET',
    resultHandler: (result) => {
      let r = JSON.parse(result), answer = ''
      if (r.Status === 0) {
        answer = r.Answer.length > 1 ? r.Answer.pop().data : r.Answer[0].data
      }
      return answer
    }
  },
  dnspod: {
    https: false,
    hostname: '119.29.29.29',
    port: 80,
    path: domain => '/d?dn=' + domain + '.',
    method: 'GET',
    resultHandler: result => result.split(';')[0]
  }
}

module.exports = {
  // 提供http/https dns的服务器
  httpServer: DNS.cloudflare,
  // 本地dns服务器配置
  localServer: {
    address: '127.0.0.1',
    port: 53
  },
  // 缓存策略
  cacheControl: {
    cacheFileDir: path.resolve(__dirname, '../cache/'), // 缓存文件所在目录的绝对路径
    time: 86400000, // 缓存记录保存时间，单位：毫秒
    maxNumber: 1000, // 每种记录的最大条数
    interval: 3600000, // 缓存定时写入文件，单位：毫秒
  },
  // 子进程
  childProcess: {
    num: 4 // 子进程数目，>=1
  }
}