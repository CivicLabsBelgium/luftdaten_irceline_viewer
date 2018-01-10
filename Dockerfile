#Source image
FROM node:boron

#set workdir
WORKDIR /usr/src/app

#open port
EXPOSE 5000

#copy package.json from project to docker image
COPY package.json .

#copy public dir from project to image
COPY public ./public

#install node_modules based on package.json
RUN npm install

#copy src dir from project to image
COPY src ./src

#run npm script to create a build directory in this docker image
RUN npm run build

#delete everything except the previously created build directory from this docker image
RUN rm -r ./src
RUN rm -r ./public
RUN rm -r ./node_modules
RUN rm  ./package.json

#copy package-serve.json and paste it as package.json alongside the build folder
COPY package-serve.json ./package.json

#install node_modules based on package-serve.json
#this json config contains only the minimum dependencies to support npm serve
RUN npm install

#the only thing left in this image are a build directory and a slimmed down node_modules to npm serve this build
CMD [ "npm", "start" ]