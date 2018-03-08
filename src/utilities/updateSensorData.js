import store from '../redux/store'
import {
  addStations, setLuftdaten1HrMeans, setLuftdaten24HrMeans, setReachable,
  setUpdating
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
    hourly: 'http://api.luftdaten.info/static/v2/data.1h.json',
    daily: 'http://api.luftdaten.info/static/v2/data.24h.json'
  }

  const hourlyPromise = new Promise((resolve, reject) => fetchStations.luftdatenMean(url.hourly).then(resolve).catch(reject))
  const dailyPromise = new Promise((resolve, reject) => fetchStations.luftdatenMean(url.daily).then(resolve).catch(reject))
  let [hourly, daily] = await Promise.all([hourlyPromise, dailyPromise])

  const stationsWithMeans = store.getState().stationUpdates.stations.map(
    station => {
      station.sensors = station.sensors.map(
        sensor => {
          const sensorHourlyPM10 = hourly.find(sensorHourly => sensorHourly.sensor.id.toString() === sensor.id
          )
          return sensor
        }
      )
      return station
    }
  )

  console.log(stationsWithMeans, hourly, daily)
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