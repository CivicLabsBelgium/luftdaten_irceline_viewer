import { setReachable, setUpdating } from '../redux/stationUpdates/actions'
import store from '../redux/store'
import * as genericFunctions from './genericFunctions'
import { globalConfig } from '../config'
import { setTime } from '../redux/appState/actions'

export const luftdatenMean = async url => {
  return genericFunctions.fetchJson(url)
}

export const luftdaten = async () => {
  if (store.getState().appState.dataOrigin.luftdaten === false) return

  let luftdatenAllUrl = globalConfig.luftdatenURL1
  let luftdatenAllJson = await genericFunctions.fetchJson(luftdatenAllUrl, 'luftdaten')
  if (globalConfig.luftdatenURL2 && globalConfig.luftdatenURL2.length) {
    let luftdatenTempAllUrl = globalConfig.luftdatenURL2
    let luftdatenTempAllJson = await genericFunctions.fetchJson(luftdatenTempAllUrl, 'luftdatenTemp')
    luftdatenAllJson = luftdatenAllJson.concat(luftdatenTempAllJson)
  }

  return luftdatenAllJson
}
const ircelinePhenomenonIndex = {
  'PM10': 5,
  'PM25': 6001,
  'temperature': 62101
}

export const irceline = async () => {
  if (store.getState().appState.dataOrigin.luftdaten === false) return

  store.dispatch(setReachable(true, 'irceline'))
  store.dispatch(setTime(null))
  store.dispatch(setUpdating(true, 'irceline'))

  let ircelinePm10Url = `https://geo.irceline.be/sos/api/v1/stations?phenomenon=${ircelinePhenomenonIndex.pm10}`
  let ircelinePm25Url = `https://geo.irceline.be/sos/api/v1/stations?phenomenon=${ircelinePhenomenonIndex.pm25}`
  let ircelineTempUrl = `https://geo.irceline.be/sos/api/v1/stations?phenomenon=${ircelinePhenomenonIndex.temperature}`

  let ircelinePm10Json = await genericFunctions.fetchJson(ircelinePm10Url, 'irceline')
  let ircelinePm25Json = await genericFunctions.fetchJson(ircelinePm25Url, 'irceline')
  let ircelineTempJson = await genericFunctions.fetchJson(ircelineTempUrl, 'irceline')

  return await [...ircelinePm10Json, ...ircelinePm25Json, ...ircelineTempJson]
}