const defaultState = []

export default function stations (state = defaultState, action) {

  switch (action.type) {
    case 'STATIONS_SET_STATIONS':
      return action.stations

    default:
      return state
  }
}