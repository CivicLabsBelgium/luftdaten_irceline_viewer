const got = require('got')

class Irceline {
  constructor () {
    this.ircelinePhenomenonIndex = {
      PM10: 5,
      PM25: 6001,
      temperature: 62101
    }
    this.data = []
    this.stations = []

    setInterval(() => this.getData(), 1000 * 60 * 5)
    this.getStations()
  }

  async getStations () {
    try {
      const ircelinePm10Json = (await got(`https://geo.irceline.be/sos/api/v1/stations?phenomenon=${this.ircelinePhenomenonIndex.PM10}`, { json: true })).body
      const ircelinePm25Json = (await got(`https://geo.irceline.be/sos/api/v1/stations?phenomenon=${this.ircelinePhenomenonIndex.PM25}`, { json: true })).body
      const ircelineTempJson = (await got(`https://geo.irceline.be/sos/api/v1/stations?phenomenon=${this.ircelinePhenomenonIndex.temperature}`, { json: true })).body
      // Merge all stations
      const stations = [...ircelinePm10Json, ...ircelinePm25Json, ...ircelineTempJson]
      // Get list of unique stations
      const uniqueStations = new Set([...stations.map(station => station.properties.id)])
      // return list of unique stations
      this.stations = [...uniqueStations].map(stationId => {
        return stations.find(station => station.properties.id === stationId)
      })
      // Get the current data for each station
      this.getData()
      console.log('got irceline stations', new Date())
    } catch (error) {
      console.log(`Irceline --> getStations ERROR: ${error.name} for ${error.url}`)
    }
  }

  async getData () {
    if (this.stations.length === 0) return
    try {
      // get data for every station
      this.data = await Promise.all(this.stations.map(async (station) => {
        const pm10RequestUrl = `https://geo.irceline.be/sos/api/v1/timeseries?expanded=true&station=${station.properties.id}&phenomenon=${this.ircelinePhenomenonIndex.PM10}&force_latest_values=true`
        const pm25RequestUrl = `https://geo.irceline.be/sos/api/v1/timeseries?expanded=true&station=${station.properties.id}&phenomenon=${this.ircelinePhenomenonIndex.PM25}&force_latest_values=true`
        const tempRequestUrl = `https://geo.irceline.be/sos/api/v1/timeseries?expanded=true&station=${station.properties.id}&phenomenon=${this.ircelinePhenomenonIndex.temperature}&force_latest_values=true`

        const pm10Response = ((await got(pm10RequestUrl, { json: true })).body || [])[0]
        const pm25Response = ((await got(pm25RequestUrl, { json: true })).body || [])[0]
        const tempResponse = ((await got(tempRequestUrl, { json: true })).body || [])[0]

        // get the sensorId from one of the sensor values
        const sensorId = (pm10Response) ? pm10Response.id : (pm25Response) ? pm25Response.id : (tempResponse) ? tempResponse.id : null
        let sensorName = (pm10Response) ? pm10Response.parameters.procedure.label : (pm25Response) ? pm25Response.parameters.procedure.label : (tempResponse) ? tempResponse.parameters.procedure.label : null

        if (sensorId === null || sensorName === null) return false

        sensorName = sensorName.split(' - ')[1].split(';')[0]
        const PM10 = (pm10Response && pm10Response.lastValue.value >= 0) ? pm10Response.lastValue.value : null
        const PM25 = (pm25Response && pm25Response.lastValue.value >= 0) ? pm25Response.lastValue.value : null
        const temperature = (tempResponse && tempResponse.lastValue.value >= 0) ? tempResponse.lastValue.value : null

        // create a sensor location or station
        const sensorLocation = {
          id: 'I-' + station.properties.id,
          latitude: station.geometry.coordinates[1],
          longitude: station.geometry.coordinates[0],
          origin: 'irceline',
          sensors: []
        }

        // add a PM sensor if it exists
        if (pm10Response || pm25Response) {
          const sensor = {
            id: 'I-' + sensorId + 'p',
            manufacturer: '',
            name: sensorName,
            stationID: 'I-' + station.properties.id
          }
          if (PM10) {
            sensor.PM10 = PM10
          }
          if (PM25) {
            sensor.PM25 = PM25
          }
          sensorLocation.sensors.push(sensor)
        }

        // add a temperature sensor if the data exists
        if (temperature) {
          sensorLocation.sensors.push({
            id: 'I-' + sensorId + 't',
            manufacturer: '',
            name: sensorName,
            temperature,
            stationID: 'I-' + station.properties.id
          })
        }

        return sensorLocation
      }))

      // set a timestamp for this fetch
      this.dataTimeStamp = new Date()
      console.log('got irceline data', new Date())
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = Irceline
