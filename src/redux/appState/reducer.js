const defaultState = {
  station: null,
  time: null,
  phenomenon: 'PM25',
  phenomenonMeta: {
    PM25: {
      values: [0, 20, 40, 60, 100, 500],
      colors: [
        '#205050',
        '#00796B',
        '#F9A825',
        '#E65100',
        '#DD2C00',
        '#960084'],
      max: 50, //max non-hazardous value
      unit: 'g/m³',
      name: 'Particulate Matter < 2.5µm'
    },
    PM10: {
      values: [0, 20, 40, 60, 100, 500],
      colors: [
        '#205050',
        '#00796B',
        '#F9A825',
        '#E65100',
        '#DD2C00',
        '#960084'],
      max: 50, //max non-hazardous value
      unit: 'g/m³',
      name: 'Particulate Matter < 10µm'
    },
    temperature: {
      values: [-30, -20, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35],
      colors: [
        '#9FF', //-30
        '#9FC', //-20
        '#9F9', //-10
        '#9F6', //-5
        '#9F3', // 0
        '#9F0', // 5
        '#9C0', // 10
        '#990', // 15
        '#960', // 20
        '#930', // 25
        '#900', // 30
        '#C00', // 35
      ],
      max: 30, //max non-hazardous value
      unit: '°C',
      name: 'Temperature'
    },
    humidity: {
      values: [0, 20, 40, 60, 80, 100],
      colors: [
        '#206',
        '#236',
        '#255',
        '#695',
        '#5A5',
        '#FF4',
      ],
      max: 100, //max non-hazardous value
      unit: '%',
      name: 'Humidity'
    },

  }
}

export default function appState(state = defaultState, action) {
  const newState = Object.assign({}, state)
  switch (action.type) {
    case 'APPSTATE_SET_CURRENT_STATION':
      newState.station = (newState.station === action.station)? null : action.station;
      return newState

    case 'APPSTATE_SET_PHENOMENON':
      newState.phenomenon = action.phenomenon;
      return newState

    case 'APPSTATE_SET_TIME':
      newState.time = action.time;
      return newState

    default:
      return state
  }
}