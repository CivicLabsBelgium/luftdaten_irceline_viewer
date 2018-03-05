### A docker image built with this Dockerfile, will contain the following:
###     - node (boron version), the base of this image
###     - certbot, a program which can request ssl certificates with the free certificate authority (CA), "letsencrypt.org"
###     - generate_ssl_certificate.sh, a bash script that will use the webroot method of certbot to attempt to generate SSL certificates
###     - "Luftdaten/Irceline Viewer", the built version of the create-react-app source
###     - server.js, an express application which will serve the build of "Luftdaten/Irceline Viewer" statically on http (and optionally https), as well as accept challenges from certbot.


#Source image
FROM node:boron

#install letsencrypt's certbot, make it executable
WORKDIR /certbot
RUN wget https://dl.eff.org/certbot-auto \
 && chmod a+x certbot-auto \
 && ./certbot-auto -n; exit 0

#set workdir
WORKDIR /usr/src/app

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

#delete everything except the previously created build directory from this directory
RUN rm -r ./src
RUN rm -r ./public
RUN rm -r ./node_modules
RUN rm  ./package.json

#copy package-serve.json and paste it as package.json alongside the build folder
COPY package-serve.json ./package.json

#install node_modules based on package-serve.json
#this json config contains only the minimum dependencies to support npm serve
RUN npm install

#copy ssl certificate folder alongside the build folder
COPY ssl ./ssl

#copy the express server.js file alongside the build folder
COPY server.js ./server.js

#open port
EXPOSE 80
EXPOSE 443

#update the package index, install sudo & chron, clean the package index
RUN apt-get update \
 && apt-get -y install cron \
 && apt-get clean

#copy generate_ssl_certificate.sh, make it executable
COPY generate_ssl_certificate.sh /
RUN chmod +x /generate_ssl_certificate.sh

#set workdir
WORKDIR /usr/src/app

#this entrypoint refers to the "start" script in package-serve.json
CMD [ "node", "server.js" ]