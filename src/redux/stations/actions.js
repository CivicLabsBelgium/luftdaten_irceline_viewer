export function addStations(stations) {
  return {
    type: 'STATIONS_SET_STATIONS',
    stations: stations
  }
}