import {combineReducers} from 'redux'
import appState from './appState/reducer'
import stations from './stations/reducer'
import map from './map/reducer'

const appReducer = combineReducers ({
  appState,
  stations,
  map
})


export default appReducer