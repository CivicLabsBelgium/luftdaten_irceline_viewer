import { combineReducers } from 'redux'
import appState from './appState/reducer'
import stationUpdates from './stationUpdates/reducer'

const appReducer = combineReducers({
  appState,
  stationUpdates
})

export default appReducer
