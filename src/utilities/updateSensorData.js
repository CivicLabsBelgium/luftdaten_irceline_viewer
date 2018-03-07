import store from '../redux/store'
import { addStations, setReachable, setUpdating } from '../redux/stationUpdates/actions'
import { setTime } from '../redux/appState/actions'
import * as fetchStations from './fetchStations'
import * as parseStations from './parseStations'

const stationsBoth = {
  luftdaten: [],
  luftdatenTemp: [],
  irceline: []
}

export const updateLuftdaten = async () => {

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

export const updateIrceline = async () => {
  const ircelineStations = await fetchStations.irceline()

  stationsBoth.irceline = await parseStations.irceline(ircelineStations)

  if (ircelineStations.length === 0)
    store.dispatch(setReachable(false, 'irceline'))

  combineData()
  store.dispatch(setUpdating(false, 'irceline'))
}

export const combineData = () => {

  const time = new Date().toLocaleTimeString()
  store.dispatch(setTime(time))

  let stations = stationsBoth.luftdaten.concat(stationsBoth.irceline)
  store.dispatch(addStations(stations))
}