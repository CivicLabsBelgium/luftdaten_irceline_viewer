FROM node:boron

WORKDIR /usr/src/app

COPY package.json .

RUN npm install

CMD [ "node_modules/.bin/build", "build" ]

COPY build ./build

EXPOSE 5000

CMD [ "node_modules/.bin/serve", "-s", "build" ]