FROM node:boron

WORKDIR /usr/src/app

COPY package.json .

RUN npm install

COPY . .

CMD [ "node_modules/.bin/react-scripts", "build" ]

EXPOSE 5000

CMD [ "node_modules/.bin/serve", "-s", "build" ]