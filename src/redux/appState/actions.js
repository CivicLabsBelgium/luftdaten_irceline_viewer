export function setCurrentStationList (stationList) {
  return {
    type: 'APPSTATE_SET_CURRENT_STATIONLIST',
    stationList
  }
}

export function setCurrentSensor (sensor) {
  return {
    type: 'APPSTATE_SET_CURRENT_SENSOR',
    sensor
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

