# 可以改成你喜欢的nodejs版本，需要支持promise
FROM node:8.9.1

RUN mkdir -p /user/src/app
WORKDIR /user/src/app

COPY . /user/src/app
RUN npm install --registry=https://registry.npm.taobao.org

EXPOSE 53/udp

ENTRYPOINT ["node", "app.js"]