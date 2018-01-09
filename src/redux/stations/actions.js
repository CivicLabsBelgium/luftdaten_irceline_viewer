export function addStations (stations) {
  return {
    type: 'STATIONS_SET_STATIONS',
    stations: stations
  }
}

export function setReachable (status, source) {
  return {
    type: 'STATIONS_SET_REACHABLE',
    status: status,
    source: source
  }
}

export function setUpdating (status, source) {
  return {
    type: 'STATIONS_SET_UPDATING',
    status: status,
    source: source
  }
}