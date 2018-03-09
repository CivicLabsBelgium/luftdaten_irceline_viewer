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
  const url= {
    hourly: 'https://api.luftdaten.info/static/v2/data.1h.json',
    daily: 'https://api.luftdaten.info/static/v2/data.24h.json'
  }

  store.dispatch(setMeansLastUpdated(new Date()))

  const hourlyPromise = new Promise((resolve, reject) => fetchStations.luftdatenMean(url.hourly).then(resolve).catch(reject))
  const dailyPromise = new Promise((resolve, reject) => fetchStations.luftdatenMean(url.daily).then(resolve).catch(reject))
  let [hourly, daily] = await Promise.all([hourlyPromise, dailyPromise])

  const stationsWithMeans = store.getState().stationUpdates.stations.map(
    station => {
      station.sensors = station.sensors.map(
        sensor => {
          let sensorHourly = hourly.find(sensorHourly => 'L-'.concat(sensorHourly.sensor.id) === sensor.id)
          sensorHourly = sensorHourly && sensorHourly.sensordatavalues
          // console.log('sensorHourly:', sensorHourly)
          // console.log('sensourHourly:', sensorHourly)
          if(sensor.PM10) {
            const pm10Sensor = sensorHourly.find(sensorHourly => sensorHourly.value_type === 'P1')
            const pm10mean = pm10Sensor && pm10Sensor.value
            if(pm10mean)
              sensor.PM10mean = pm10mean
          }
          if(sensor.PM25) {
            const pm25Sensor = sensorHourly.find(sensorHourly => sensorHourly.value_type === 'P2')
            const pm25mean = pm25Sensor && pm25Sensor.value
            if(pm25mean)
              sensor.PM25mean = pm25mean
          }
          if(sensor.temperature) {
            const temperatureSensor = sensorHourly.find(sensorHourly => sensorHourly.value_type === 'temperature')
            const temperatureMean = temperatureSensor && temperatureSensor.value
            if(temperatureMean) {

              sensor.temperatureMean = temperatureMean
              console.log('updated temperature mean for', sensor)
            }
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
  if(store.getState().appState.dataOrigin.luftdaten) {
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
  if(store.getState().appState.dataOrigin.irceline) {
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