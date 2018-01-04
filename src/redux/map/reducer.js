const defaultState = {
  map: null
}

export default function appState(state = defaultState, action) {
  const newState = Object.assign({}, state)
  switch (action.type) {
    case 'MAP_SET_MAP':
      newState.map = action.map;
      return newState

    default:
      return state
  }
}