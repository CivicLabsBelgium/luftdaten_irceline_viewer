const defaultState = {
  dataOrigin: {
    luftdaten: true,
    irceline: true
  },
  mapCoords: null,
  sensor: null,
  stationList: null,
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
      max: 25, //max non-hazardous value
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
      values: [-10, -5, 0, 5, 10, 15, 20, 25, 30, 35],
      colors: [
        '#9FF', //-10
        '#9F9', //-5
        '#9F6', // 0
        '#9F3', // 5
        '#9F0', // 10
        '#9C0', // 15
        '#990', // 20
        '#960', // 25
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

export default function appState (state = defaultState, action) {
  const newState = Object.assign({}, state)
  switch (action.type) {
    case 'APPSTATE_SET_CURRENT_STATIONLIST':
      newState.stationList = (newState.stationList === action.stationList) ? null : action.stationList
      newState.sensor = null
      return newState

    case 'APPSTATE_SET_CURRENT_SENSOR':
      newState.sensor = (newState.sensor === action.sensor) ? null : action.sensor
      return newState

    case 'APPSTATE_SET_MAP_COORDS':
      newState.mapCoords = action.coords
      return newState

    case 'APPSTATE_SET_PHENOMENON':
      newState.phenomenon = action.phenomenon
      return newState

    case 'APPSTATE_SET_TIME':
      newState.time = action.time
      return newState

    case 'APPSTATE_SET_DATA_ORIGIN':
      newState.dataOrigin = action.dataOrigin
      return newState

    default:
      return state
  }
}