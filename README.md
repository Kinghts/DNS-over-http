# DNS-over-http
自用的DNS over http服务器
# 安装
npm install
# 启动
node app.js
然后将你的首选DNS服务器地址改为127.0.0.1(可在/config/server.config.js文件里配置)
# 说明
DNS服务器的代码来自[node-named](https://github.com/trevoro/node-named)项目

默认使用dnspod的http接口[dnspod](https://www.dnspod.cn/misc/D%2B%E5%85%8D%E8%B4%B9%E7%89%88%E6%9C%AC%E6%8E%A5%E5%8F%A3%E8%AF%B4%E6%98%8E.pdf)

# 配置
config目录包含了所有配置文件

base.config.js 用于指定下面4个配置文件所在目录

block.config.js 可以配置需要屏蔽的域名

hosts.config.js 可以自定义域名解析结果

log4js.config.js 是服务器的日志设置，可以参考[log4js-node](https://nomiddlename.github.io/log4js-node/)进行配置

server.config.js 可以配置服务器的监听端口、ip和缓存设置

# 常见问题
## 在windows上启动失败
可能是53端口被其他程序占用，请关闭该程序/服务后再重新启动