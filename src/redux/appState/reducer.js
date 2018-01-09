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
      data: [
        {color: '#205050', value: 0},
        {color: '#00796B', value: 20},
        {color: '#F9A825', value: 40},
        {color: '#E65100', value: 60},
        {color: '#DD2C00', value: 100},
        {color: '#960084', value: 500}
      ],
      max: 25, //max non-hazardous value
      unit: 'g/m³',
      name: 'Particulate Matter < 2.5µm'
    },
    PM10: {
      data: [
        {color: '#205050', value: 0},
        {color: '#00796B', value: 20},
        {color: '#F9A825', value: 40},
        {color: '#E65100', value: 60},
        {color: '#DD2C00', value: 100},
        {color: '#960084', value: 500}
      ],
      max: 50, //max non-hazardous value
      unit: 'g/m³',
      name: 'Particulate Matter < 10µm'
    },
    temperature: {
      data: [
        {color: '#9FF', value: -10},
        {color: '#9F6', value: 0},
        {color: '#9F0', value: 10},
        {color: '#990', value: 20},
        {color: '#900', value: 30},
        {color: '#C00', value: 40}
      ],
      max: 30, //max non-hazardous value
      unit: '°C',
      name: 'Temperature'
    },
    humidity: {
      data: [
        {color: '#206', value: 0},
        {color: '#236', value: 20},
        {color: '#255', value: 40},
        {color: '#695', value: 60},
        {color: '#5A5', value: 80},
        {color: '#FF4', value: 100}
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