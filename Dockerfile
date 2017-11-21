# 可以改成你喜欢的nodejs版本，需要支持promise
FROM node:8.9.1

# 指定容器的时区
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai  /etc/localtime

RUN mkdir -p /user/src/volume
RUN mkdir -p /user/src/app
WORKDIR /user/src/app

COPY . /user/src/app
RUN npm install --registry=https://registry.npm.taobao.org

EXPOSE 53/udp

ENTRYPOINT ["node", "app.js"]