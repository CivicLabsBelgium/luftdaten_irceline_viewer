export function addStations (stations) {
  return {
    type: 'STATIONUPDATES_SET_STATIONS',
    stations: stations
  }
}

export function setReachable (status, source) {
  return {
    type: 'STATIONUPDATES_SET_REACHABLE',
    status: status,
    source: source
  }
}

export function setUpdating (status, source) {
  return {
    type: 'STATIONUPDATES_SET_UPDATING',
    status: status,
    source: source
  }
}

export function setLuftdaten1HrMeans (data) {
  return {
    type: 'STATIONUPDATES_SET_1HR_MEANS',
    data
  }
}

export function setLuftdaten24HrMeans (data) {
  return {
    type: 'STATIONUPDATES_SET_24HR_MEANS',
    data
  }
}

export function setMeansLastUpdated (meansLastUpdated) {
  return {
    type: 'APPSTATE_SET_MEANS_LAST_UPDATED',
    meansLastUpdated
  }
}
