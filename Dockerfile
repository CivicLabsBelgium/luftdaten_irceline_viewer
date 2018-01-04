FROM node:boron

WORKDIR /usr/src/app

RUN npm install serve

COPY build build/

EXPOSE 5000

CMD [ "node_modules/.bin/serve", "-s", "build" ]