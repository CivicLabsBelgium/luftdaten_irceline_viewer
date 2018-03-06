import { globalConfig } from '../config'
import * as genericFunctions from './generic_functions'
import store from '../redux/store'
import { addStations, setReachable, setUpdating } from '../redux/stationUpdates/actions'
import { setTime } from '../redux/appState/actions'

const stationsBoth = {
  luftdaten: [],
  luftdatenTemp: [],
  irceline: []
}

export const updateLuftdaten = async () => {
  stationsBoth.luftdaten = []

  if (store.getState().appState.dataOrigin.luftdaten === false) return

  store.dispatch(setReachable(true, 'luftdaten'))
  store.dispatch(setTime(null))
  store.dispatch(setUpdating(true, 'luftdaten'))

  let luftdatenAllUrl = globalConfig.luftdatenURL1
  let luftdatenAllJson = await genericFunctions.fetchJson(luftdatenAllUrl, 'luftdaten')
  if (globalConfig.luftdatenURL2 != '') {
    let luftdatenTempAllUrl = globalConfig.luftdatenURL2
    let luftdatenTempAllJson = await genericFunctions.fetchJson(luftdatenTempAllUrl, 'luftdatenTemp')
    luftdatenAllJson = luftdatenAllJson.concat(luftdatenTempAllJson)
  }
  let luftdatenStations = parseLuftdatenData(luftdatenAllJson)

  const time = new Date().toLocaleTimeString()
  store.dispatch(setTime(time))
  store.dispatch(setUpdating(false, 'luftdaten'))

  stationsBoth.luftdaten = luftdatenStations
  combineData()
}

export const updateIrceline = async () => {
  stationsBoth.irceline = []

  if (store.getState().appState.dataOrigin.luftdaten === false) return

  store.dispatch(setReachable(true, 'irceline'))
  store.dispatch(setTime(null))
  store.dispatch(setUpdating(true, 'irceline'))

  /// Irceline fetch
  let ircelinePm10Url = 'https://geo.irceline.be/sos/api/v1/stations?phenomenon=5'
  let ircelinePm25Url = 'https://geo.irceline.be/sos/api/v1/stations?phenomenon=6001'
  let ircelineTempUrl = 'https://geo.irceline.be/sos/api/v1/stations?phenomenon=62101'

  let ircelinePm10Json = await genericFunctions.fetchJson(ircelinePm10Url, 'irceline')
  let ircelinePm25Json = await genericFunctions.fetchJson(ircelinePm25Url, 'irceline')
  let ircelineTempJson = await genericFunctions.fetchJson(ircelineTempUrl, 'irceline')

  let ircelinePm10Promise = await parseIrcelineData(ircelinePm10Json)
  let ircelinePm25Promise = await parseIrcelineData(ircelinePm25Json)
  let ircelineTempPromise = await parseIrcelineData(ircelineTempJson)

  let ircelineStations = await [...ircelinePm10Promise, ...ircelinePm25Promise, ...ircelineTempPromise]

  ircelineStations = ircelineStations.reduce(
    (accumulator, station) => {
      let duplicate = accumulator.find(
        (stationDuplicateCheck) => {
          return stationDuplicateCheck.id === station.id
        }
      )

      if (!duplicate) {
        accumulator.push(station)
      }

      return accumulator
    }, []
  )

  const time = new Date().toLocaleTimeString()
  store.dispatch(setTime(time))
  store.dispatch(setUpdating(false, 'irceline'))

  if (ircelineStations.length === 0) store.dispatch(setReachable(false, 'irceline'))
  stationsBoth.irceline = ircelineStations
  combineData()
}

export const combineData = () => {
  let stations = stationsBoth.luftdaten.concat(stationsBoth.irceline)
  store.dispatch(addStations(stations))
}

const parseIrcelineData = async (data) => {
  let dataArray = data.map(async (station) => {
    let pm10RequestUrl = 'https://geo.irceline.be/sos/api/v1/timeseries?expanded=true&station=' + station.properties.id + '&phenomenon=5&force_latest_values=true'
    let pm25RequestUrl = 'https://geo.irceline.be/sos/api/v1/timeseries?expanded=true&station=' + station.properties.id + '&phenomenon=6001&force_latest_values=true'
    let tempRequestUrl = 'https://geo.irceline.be/sos/api/v1/timeseries?expanded=true&station=' + station.properties.id + '&phenomenon=62101&force_latest_values=true'

    let ircelineData = await (async () => {
      let pm10Request, pm25Request, tempRequest
      try {
        pm10Request = await genericFunctions.fetchJson(pm10RequestUrl) || []
        pm25Request = await genericFunctions.fetchJson(pm25RequestUrl) || []
        tempRequest = await genericFunctions.fetchJson(tempRequestUrl) || []
      } catch (e) {
        console.log('invalid irceline data', e)
      }
      let pm10Response = pm10Request[0] || false
      let pm25Response = pm25Request[0] || false
      let tempResponse = tempRequest[0] || false
      return [pm10Response, pm25Response, tempResponse]
    })().then(data => data)

    let pm10Response = ircelineData[0]
    let pm25Response = ircelineData[1]
    let tempResponse = ircelineData[2]

    let sensorID = (pm10Response) ? pm10Response.id : (pm25Response) ? pm25Response.id : (tempResponse) ? tempResponse.id : null
    let sensorName = (pm10Response) ? pm10Response.parameters.procedure.label : (pm25Response) ? pm25Response.parameters.procedure.label : (tempResponse) ? tempResponse.parameters.procedure.label : null

    if (sensorID === null || sensorName === null) return false

    sensorName = sensorName.split(' - ')[1].split(';')[0]
    let PM10 = (pm10Response && pm10Response.lastValue.value >= 0) ? pm10Response.lastValue.value : null
    let PM25 = (pm25Response && pm25Response.lastValue.value >= 0) ? pm25Response.lastValue.value : null
    let temp = (tempResponse && tempResponse.lastValue.value >= 0) ? tempResponse.lastValue.value : null

    /// Splitting sensor into PM or temperature sensor
    let PMObject = (pm10Response || pm25Response) ? {
      id: 'I-' + sensorID + 'p',
      manufacturer: null,
      name: sensorName,
      PM10: PM10,
      PM25: PM25,
      stationID: 'I-' + station.properties.id
    } : null

    let tempObject = (tempResponse) ? {
      id: 'I-' + sensorID + 't',
      manufacturer: null,
      name: sensorName,
      temperature: temp,
      stationID: 'I-' + station.properties.id
    } : null

    let sensors = [
      PMObject,
      tempObject
    ].filter(
      (sensor) => {
        return sensor !== null
      }
    )

    return {
      id: 'I-' + station.properties.id,
      latitude: station.geometry.coordinates[1],
      longitude: station.geometry.coordinates[0],
      origin: 'irceline',
      sensors: sensors
    }
  })

  //reduce data array to collection of valid dataSets, filter out invalid API returns
  dataArray = await Promise.all(dataArray)
  dataArray = dataArray.reduce(
    (validData, dataSet) => dataSet ? validData.concat(dataSet) : validData,
    []
  )
  return dataArray
}

const parseLuftdatenData = (data) => {
  let parsedDataArray = []
  data.forEach(
    (station) => {

      let is_valid = true

      if (parsedDataArray.find(
          (duplicateCheck) => {
            return duplicateCheck.id === station.location.id
          }
        )) {
        return
      }

      let parsedStation = {
        id: station.location.id,
        latitude: station.location.latitude,
        longitude: station.location.longitude,
        altitude: station.location.altitude,
        origin: 'luftdaten',
        sensors: []
      }

      let duplicates = data.filter(
        (duplicateCheck) => {
          return duplicateCheck.location.id === station.location.id
        }
      )
      duplicates.push(station)
      duplicates.sort(genericFunctions.sortRawDataByTimestamp)

      for (let d in duplicates) {
        let currentStation = duplicates[d]

        for (let s in currentStation.sensordatavalues) {
          let currentSensorDataValue = currentStation.sensordatavalues[s]
          let currentSensor = parsedStation.sensors
            .find(
              (sensor) => {
                return sensor.id === 'L-' + currentStation.sensor.id
              }
            )
          if (currentSensor) {
            parsedStation.sensors = parsedStation.sensors.filter(
              (sensor) => {
                return sensor.id !== currentSensor.id
              }
            )
          } else {
            currentSensor = {
              id: 'L-' + currentStation.sensor.id,
              manufacturer: currentStation.sensor.sensor_type.manufacturer,
              name: currentStation.sensor.sensor_type.name,
              stationID: 'L-' + station.location.id
            }
          }

          switch (currentSensorDataValue.value_type) {
            case 'P1':
              if (currentSensorDataValue.value < 1990) {
                currentSensor.PM10 = currentSensorDataValue.value
              } else {
                is_valid = false
              }
              break
            case 'P2':
              if (currentSensorDataValue.value < 990) {
                currentSensor.PM25 = currentSensorDataValue.value
              } else {
                is_valid = false
              }
              break
            case 'temperature':
              if (currentSensorDataValue.value >= -100 && currentSensorDataValue.value <= 100) {
                currentSensor.temperature = currentSensorDataValue.value
              } else {
                is_valid = false
              }
              break
            case 'humidity':
              if (currentSensorDataValue.value >= 0 && currentSensorDataValue.value <= 100) {
                currentSensor.humidity = currentSensorDataValue.value
              } else {
                is_valid = false
              }
              break
            case 'pressure_at_sealevel':
              if (currentSensorDataValue.value >= 90000 && currentSensorDataValue.value <= 120000) {
                currentSensor.pressure = currentSensorDataValue.value / 100
              } else {
                is_valid = false
              }
              break
            default:
              break
          }
          parsedStation.sensors.push(currentSensor)
        }
      }

      if (is_valid) parsedDataArray.push(parsedStation)
    })

  return parsedDataArray
}
