import store from '../redux/store'
import {
  addStations, setReachable,
  setUpdating
} from '../redux/stationUpdates/actions'
import { setTime } from '../redux/appState/actions'
import request from '../request/request'

const stationsBoth = {
  luftdaten: [],
  irceline: []
}

export const updateLuftdaten = async () => {
  if (store.getState().appState.dataOrigin.luftdaten) {
    const options = {
      method: 'GET',
      url: window.origin + '/luftdaten'
    }

    store.dispatch(setReachable(true, 'luftdaten'))
    store.dispatch(setTime(null))
    store.dispatch(setUpdating(true, 'luftdaten'))

    request(options)
      .then(res => {
        console.log('Got Luftdaten data')
        if (!res.data) {
          throw new Error('Luftdaten data is undefined')
        }
        stationsBoth.luftdaten = res.data
        combineData()
        store.dispatch(setUpdating(false, 'luftdaten'))
      }
      )
      .catch(() => {
        console.warn('Luftdaten data request has failed')
        store.dispatch(setReachable(false, 'luftdaten'))
      }
      )
  }
}

export const updateIrceline = async () => {
  if (store.getState().appState.dataOrigin.irceline) {
    const options = {
      method: 'GET',
      url: window.origin + '/irceline'
    }

    store.dispatch(setReachable(true, 'irceline'))
    store.dispatch(setTime(null))
    store.dispatch(setUpdating(true, 'irceline'))

    request(options)
      .then(res => {
        console.log('Got IRCELINE data')
        if (!res.data) {
          throw new Error('IRCELINE data is undefined')
        }
        stationsBoth.irceline = res.data
        combineData()
        store.dispatch(setUpdating(false, 'irceline'))
      }
      )
      .catch(() => {
        console.warn('IRCELINE data request has failed')
        store.dispatch(setReachable(false, 'irceline'))
      }
      )
  }
}

export const combineData = () => {
  const time = new Date().toLocaleTimeString()
  store.dispatch(setTime(time))

  const stations = [...stationsBoth.luftdaten, ...stationsBoth.irceline]
  store.dispatch(addStations(stations))
}
