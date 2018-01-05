import {combineReducers} from 'redux'
import appState from './appState/reducer'
import stations from './stations/reducer'

const appReducer = combineReducers ({
  appState,
  stations
})


export default appReducer