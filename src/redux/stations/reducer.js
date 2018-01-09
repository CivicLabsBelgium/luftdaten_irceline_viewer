const defaultState = {
  stations: [],
  isReachable: {
    luftdaten: true,
    irceline: true
  },
  isUpdating: {
    luftdaten: false,
    irceline: false
  }
}

export default function stations (state = defaultState, action) {

  const newState = Object.assign({}, state)

  switch (action.type) {
    case 'STATIONS_SET_STATIONS':
      newState.stations = action.stations
      return newState

    case 'STATIONS_SET_REACHABLE':
      newState.isReachable[action.source] = action.status
      return newState

    case 'STATIONS_SET_UPDATING':
      newState.isUpdating[action.source] = action.status
      return newState

    default:
      return state
  }
}