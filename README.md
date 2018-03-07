#Luftdaten/irceline viewer

Luftdaten/irceline viewer is an app to display air quality sensors registered by luftdaten or irceline accross Belgium. Sensors can contain information about fine particulate matter, temperature and humidity.
This app is built with react/redux.

## User guide

Users can select one or more stations and view the linked sensor information in the sidebar. Information includes sensor manufacturer, data source (luftdaten or irceline), geolocation, last reading by the sensor, and a mean of readings by all selected sensors.
The url is constantly updated with geolocation data and the current zoom level, so that users may share the map at the current location with others. Users may also share a single selected sensor by selecting a sensor in the sidebar, and then clicking the lat/long location value. The url should be updated with the current sensor's ID.

Data source can be enabled or disabled in the filter options. By default, both data sources are enabled.
A checkmark in front of a data source means that the app has successfully retrieved sensors registered with this data source.
An hourglass icon means that this data source is currently being polled for sensor updates.
A cross means that this data source was unreachable.
Luftdaten sensor data updates every minute.
Irceline sensor data updates every 10 minutes (needs to do a lot more API calls to retrieve all sensors).
Luftdaten sensors are prefixed with "L-" and Irceline sensors are prefixed with "I-".

Users may select a phenomenon (PM2.5 by default) to show color coded markers for every sensor that has a reading for this phenomenon
The color coded legend displays all the colors associated with the currently selected phenomenon. A red bar indicates the threshold of dangerous levels for human exposure to the currently selected phenomenon.

## Contributing

Users may contribute by making a new issue about bugs they find or features they think should be implemented in this app.

### building and running

* copy src/config.js.dist to src/config.js , edit the copy for your needs

* With docker:
    1. `cd` to the project directory
    2. `docker build . -t luftdaten_irceline_viewer`
    3. `docker run -p 80:80 -p 443:443 luftdaten_irceline_viewer`

* Without docker:
    1. `npm install`
    2. `sudo node server.js`

* SSL with self-signed (for localhost), or otherwise obtained certificates for https support:
    1. put your .key and .crt files into the project's ssl/ directory before running the app, or building the docker container
    
* SSL with letsencrypt (a free certificate authority) on docker cloud services
    1. build the docker image
    2. set the environment variables `DOMAINNAME`, `SUBDOMAIN`, `ADMINEMAIL` to their appropriate values for your domain name. Set `NODE_ENV` to `production`
    3. spin up the container as a service
    4. to prevent losing your certificates on a redeploy, add a volume for the path `/etc/letsencrypt`