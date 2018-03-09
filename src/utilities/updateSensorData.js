import store from '../redux/store'
import {
  addStations, setReachable,
  setUpdating, setMeansLastUpdated
} from '../redux/stationUpdates/actions'
import { setTime } from '../redux/appState/actions'
import * as fetchStations from './fetchStations'
import * as parseStations from './parseStations'

const stationsBoth = {
  luftdaten: [],
  luftdatenTemp: [],
  irceline: []
}

export const updateLuftdatenMean = async () => {
  const url = {
    hourly: 'https://api.luftdaten.info/static/v2/data.1h.json',
    daily: 'https://api.luftdaten.info/static/v2/data.24h.json'
  }

  store.dispatch(setMeansLastUpdated(new Date()))

  const hourlyPromise = new Promise((resolve, reject) => fetchStations.luftdatenMean(url.hourly).then(resolve).catch(reject))
  const dailyPromise = new Promise((resolve, reject) => fetchStations.luftdatenMean(url.daily).then(resolve).catch(reject))
  let [hourly, daily] = await Promise.all([hourlyPromise, dailyPromise])

  const value_types = valueType => {
    switch (valueType) {
      case 'PM10':
        return 'P1'

      case 'PM25':
        return 'P2'

      default:
        return valueType
    }
  }
  const updateSensorWithMeanValue = (sensor, stationMean, interval, valueType) => {
    if (sensor[valueType]) {
      let sensorMean = stationMean.find(sensor => sensor.value_type === value_types(valueType))
      sensorMean = (sensorMean && sensorMean.value) || false
      if (sensorMean) {
        // console.log(interval, valueType)
        sensor[interval] = sensor[interval] || {}
        sensor[interval][valueType] = sensorMean
      }
    }
    return sensor
  }

  const stationsWithMeans = store.getState().stationUpdates.stations.map(
    station => {
      station.sensors = station.sensors.map(
        sensor => {
          let sensorHourly = hourly.find(sensorHourly => 'L-'.concat(sensorHourly.sensor.id) === sensor.id)
          let sensorDaily = daily.find(sensorDaily => 'L-'.concat(sensorDaily.sensor.id) === sensor.id)
          sensorHourly = sensorHourly && sensorHourly.sensordatavalues
          sensorDaily = sensorDaily && sensorDaily.sensordatavalues
          if (sensorHourly) {
            sensor = updateSensorWithMeanValue(sensor, sensorHourly, 'hourly', 'PM25')
            sensor = updateSensorWithMeanValue(sensor, sensorHourly, 'hourly', 'PM10')
            sensor = updateSensorWithMeanValue(sensor, sensorHourly, 'hourly', 'temperature')
            sensor = updateSensorWithMeanValue(sensor, sensorHourly, 'hourly', 'humidity')
            sensor = updateSensorWithMeanValue(sensor, sensorHourly, 'hourly', 'pressure')
          }
          if (sensorDaily) {
            sensor = updateSensorWithMeanValue(sensor, sensorDaily, 'daily', 'PM25')
            sensor = updateSensorWithMeanValue(sensor, sensorDaily, 'daily', 'PM10')
            sensor = updateSensorWithMeanValue(sensor, sensorDaily, 'daily', 'temperature')
            sensor = updateSensorWithMeanValue(sensor, sensorDaily, 'daily', 'humidity')
            sensor = updateSensorWithMeanValue(sensor, sensorDaily, 'daily', 'pressure')
          }
          return sensor
        }
      )
      return station
    }
  )

  store.dispatch(addStations(stationsWithMeans))

  // console.log(stationsWithMeans, hourly, daily)
}

export const updateLuftdaten = async () => {
  if (store.getState().appState.dataOrigin.luftdaten) {
    store.dispatch(setReachable(true, 'luftdaten'))
    store.dispatch(setTime(null))
    store.dispatch(setUpdating(true, 'luftdaten'))

    const luftdatenStations = await fetchStations.luftdaten()

    stationsBoth.luftdaten = await parseStations.luftdaten(luftdatenStations)

    if (!(luftdatenStations && luftdatenStations.length))
      store.dispatch(setReachable(false, 'luftdaten'))

    combineData()
    store.dispatch(setUpdating(false, 'luftdaten'))
  }
}

export const updateIrceline = async () => {
  if (store.getState().appState.dataOrigin.irceline) {
    const ircelineStations = await fetchStations.irceline()

    stationsBoth.irceline = await parseStations.irceline(ircelineStations)

    if (ircelineStations.length === 0)
      store.dispatch(setReachable(false, 'irceline'))

    combineData()
    store.dispatch(setUpdating(false, 'irceline'))
  }
}

export const combineData = () => {

  const time = new Date().toLocaleTimeString()
  store.dispatch(setTime(time))

  let stations = stationsBoth.luftdaten.concat(stationsBoth.irceline)
  store.dispatch(addStations(stations))
}