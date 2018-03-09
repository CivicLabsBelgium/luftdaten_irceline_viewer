import { combineReducers } from 'redux'
import appState from './appState/reducer'
import stationUpdates from './stationUpdates/reducer'
import globalConfig from './globalConfig/reducer'

const appReducer = combineReducers({
  appState,
  stationUpdates,
  globalConfig
})

export default appReducer
