# 可以改成你喜欢的nodejs版本，需要支持promise
FROM daocloud.io/node:6.9.1

RUN mkdir -p /user/src/app
WORKDIR /user/src/app

COPY . /user/src/app
RUN npm install

EXPOSE 53/udp

ENTRYPOINT ["node", "app.js"]