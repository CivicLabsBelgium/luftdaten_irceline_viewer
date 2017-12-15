import { createStore } from 'redux'
import reducer from './combinedReducers'

export default createStore(reducer,
  window.devToolsExtension && window.devToolsExtension())