const got = require('got')

const valueTypes = valueType => {
  switch (valueType) {
    case 'P1':
      return 'PM10'

    case 'P2':
      return 'PM25'

    default:
      return valueType
  }
}

const updateSensorWithMeanValues = (sensorMeans) => {
  const meansData = {}
  sensorMeans.forEach(mean => {
    meansData[valueTypes(mean.value_type)] = mean.value
  })
  return meansData
}

class Luftdaten {
  constructor () {
    this.data = []
    this.hourlyMap = new Map()
    this.dailyMap = new Map()

    setInterval(() => this.getCurrentData(), 1000 * 60 * 1)
    setInterval(() => this.getMeans(), 1000 * 60 * 30)
    this.getCurrentData()
    this.getMeans()
  }

  async getCurrentData () {
    try {
      const response = await got('http://api.luftdaten.info/static/v2/data.json', {
        json: true
      })

      const currentData = response.body
      if (Array.isArray(currentData)) this.parseCurrentData(currentData)
    } catch (error) {
      console.log(`Luftdaten --> getCurrentData ERROR: ${error.name} for ${error.url}`)
    }
  }

  parseCurrentData (currentData) {
    const sensorLocations = []
    currentData.forEach((station) => {
      let isValid = true
      let isNew = false
      if (station.location.country !== 'BE') return

      let parsedSensorLocation = sensorLocations.find((existingSensorLocation) => existingSensorLocation.id === station.location.id)
      if (!parsedSensorLocation) {
        isNew = true
        parsedSensorLocation = {
          id: station.location.id,
          latitude: station.location.latitude,
          longitude: station.location.longitude,
          altitude: station.location.altitude,
          origin: 'luftdaten',
          timestamp: station.timestamp,
          sensors: []
        }
      }

      const currentSensor = {
        id: 'L-' + station.sensor.id,
        manufacturer: station.sensor.sensor_type.manufacturer,
        name: station.sensor.sensor_type.name,
        stationID: 'L-' + station.location.id
      }

      for (const s in station.sensordatavalues) {
        const currentSensorDataValue = station.sensordatavalues[s]

        switch (currentSensorDataValue.value_type) {
          case 'P1':
            if (currentSensorDataValue.value < 1990) {
              currentSensor.PM10 = Number.parseFloat(currentSensorDataValue.value).toFixed(2)
            } else {
              isValid = false
            }
            break
          case 'P2':
            if (currentSensorDataValue.value < 990) {
              currentSensor.PM25 = Number.parseFloat(currentSensorDataValue.value).toFixed(2)
            } else {
              isValid = false
            }
            break
          case 'temperature':
            if (currentSensorDataValue.value >= -100 && currentSensorDataValue.value <= 100) {
              currentSensor.temperature = Number.parseFloat(currentSensorDataValue.value).toFixed(2)
            } else {
              isValid = false
            }
            break
          case 'humidity':
            if (currentSensorDataValue.value >= 0 && currentSensorDataValue.value <= 100) {
              currentSensor.humidity = Number.parseFloat(currentSensorDataValue.value).toFixed(2)
            } else {
              isValid = false
            }
            break
          case 'pressure_at_sealevel':
            if (currentSensorDataValue.value >= 90000 && currentSensorDataValue.value <= 120000) {
              currentSensor.pressure = Number.parseFloat(currentSensorDataValue.value / 100).toFixed(2)
            } else {
              isValid = false
            }
            break
          default:
            break
        }
      }

      const sensorHourly = this.hourlyMap.get(currentSensor.id)
      const sensorDaily = this.dailyMap.get(currentSensor.id)
      if (sensorHourly) {
        currentSensor.hourly = updateSensorWithMeanValues(sensorHourly)
      }
      if (sensorDaily) {
        currentSensor.daily = updateSensorWithMeanValues(sensorDaily)
      }

      parsedSensorLocation.sensors.push(currentSensor)

      if (isValid && isNew) sensorLocations.push(parsedSensorLocation)
    })

    this.dataTimeStamp = new Date()
    this.data = sensorLocations
    console.log('got luftdaten currentData ', new Date())
  }

  async getMeans () {
    try {
      const hourly = (await got('https://api.luftdaten.info/static/v2/data.1h.json', { json: true })).body
      const daily = (await got('https://api.luftdaten.info/static/v2/data.24h.json', { json: true })).body

      if (Array.isArray(hourly)) {
        const hourlyMap = new Map()
        hourly.forEach(record => hourlyMap.set(`L-${record.sensor.id}`, record.sensordatavalues))
        this.hourlyMap = hourlyMap
      } else {
        console.log('hourly')
      }
      if (Array.isArray(daily)) {
        const dailyMap = new Map()
        daily.forEach(record => dailyMap.set(`L-${record.sensor.id}`, record.sensordatavalues))
        this.dailyMap = dailyMap
      } else {
        console.log('daily')
      }

      this.getCurrentData()
      console.log('got luftdaten means ', new Date())
    } catch (error) {
      console.log(`Luftdaten --> getMeans ERROR: ${error.name} for ${error.url}`)
    }
  }
}
module.exports = Luftdaten
