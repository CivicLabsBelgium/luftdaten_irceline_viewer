FROM node:boron

WORKDIR /usr/src/app

EXPOSE 5000

RUN ls

COPY package.json .

COPY public ./public

RUN ls

RUN npm install

COPY src ./src

RUN ls

RUN npm run build

RUN ls

CMD [ "node_modules/.bin/serve", "-s", "build" ]