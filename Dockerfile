### A docker image built with this Dockerfile, will contain the following:
###     - node (boron version), the base of this image
###     - certbot, a program which can request ssl certificates with the free certificate authority (CA), "letsencrypt.org"
###     - "Luftdaten/Irceline Viewer", the built version of the create-react-app source
###     - server.js, an express application which will serve the build of "Luftdaten/Irceline Viewer" statically on http (and optionally https), as well as accept challenges from certbot.

FROM node:carbon-alpine

# adds the packages certbot and tini
RUN apk add certbot tini --no-cache
ENTRYPOINT ["/sbin/tini", "--"]

# copy and chmod the shell script which will initiate the webroot
COPY letsencrypt_webroot.sh /
RUN chmod +x /letsencrypt_webroot.sh

RUN crond -b

# setup certificate renewal cron
COPY letsencrypt_cronjob /
RUN crontab /letsencrypt_cronjob
RUN rm /letsencrypt_cronjob

# port 80 is mandatory for webroot challenge
# port 443 is mandatory for https
EXPOSE 80
EXPOSE 443

# the directory for your app within the docker image
# NOTE: this must not be changed
WORKDIR usr/src/server

######################################################################################

# Add your own Dockerfile entries here

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

#copy server/package.json and paste it as package.json alongside the build folder
COPY server/package.json ./package.json

#install node_modules based on server/package.json
#this json config contains only the minimum dependencies to support npm serve
RUN npm install

#copy the express server.js file alongside the build folder
COPY server/server.js ./server.js

######################################################################################

# the command which starts your express server. Rename 'index.js' to the appropriate filename
CMD [ "node", "server.js" ]