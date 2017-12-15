export function setCurrentStation (station) {
  return {
    type: 'APPSTATE_SET_CURRENT_STATION',
    station
  }
}

export function setPhenomenon (phenomenon) {
  return {
    type: 'APPSTATE_SET_PHENOMENON',
    phenomenon
  }
}

export function setTime (time) {
  return {
    type: 'APPSTATE_SET_TIME',
    time
  }
}


export function setDataOrigin (dataOrigin) {
  return {
    type: 'APPSTATE_SET_DATA_ORIGIN',
    dataOrigin
  }
}

