const defaultState = {
  lang: require('../../lang/en.json'),
  dataOrigin: {
    luftdaten: true,
    irceline: true
  },
  mapCoords: null,
  id: 'init',
  sensor: null,
  stationList: null,
  time: null,
  phenomenon: 'PM25',
  phenomenonMeta: {
      PM25: {
        data: [
          // {color: '#205050', value: 0},
          // {color: '#00796B', value: 20},
          // {color: '#F9A825', value: 40},
          // {color: '#E65100', value: 60},
          // {color: '#DD2C00', value: 100},
          // {color: '#960084', value: 500}
          {color: '#70AE6E', value: 0},
          {color: '#E5C038', value: 10},
          {color: '#ea8b00', value: 20},
          {color: '#d8572a', value: 25},
          {color: '#c32f27', value: 50},
          {color: '#c32f27', value: 800}
        ],
        max: 10, //max non-hazardous value
        unit: 'µg/m³',
        name: `Particulate Matter < 2.5µm`
      },
      PM10: {
        data: [
          // {color: '#205050', value: 0},
          // {color: '#00796B', value: 20},
          // {color: '#F9A825', value: 40},
          // {color: '#E65100', value: 60},
          // {color: '#DD2C00', value: 100},
          // {color: '#960084', value: 500}
          {color: '#70AE6E', value: 0},
          {color: '#E5C038', value: 20},
          {color: '#ea8b00', value: 35},
          {color: '#d8572a', value: 50},
          {color: '#c32f27', value: 100},
          {color: '#c32f27', value: 1200}
        ],
        max: 20, //max non-hazardous value
        unit: 'µg/m³',
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
      pressure: {
        data: [
          {color: '#9FF', value: 900},
          {color: '#9F6', value: 940},
          {color: '#9F0', value: 980},
          {color: '#990', value: 1020},
          {color: '#900', value: 1060},
          {color: '#C00', value: 1100}
        ],
        max: 1000, //max non-hazardous value
        unit: 'hPa',
        name: 'Pressure'
      }
    }
}

export default function appState (state = defaultState, action) {
  const newState = Object.assign({}, state)
  switch (action.type) {
    case 'APPSTATE_SET_CURRENT_STATIONLIST':
      newState.stationList = (newState.stationList === action.stationList) ? null : action.stationList
      newState.sensor = null
      if (action.stationList === null) {
        newState.id = null
      }
      return newState

    case 'APPSTATE_SET_CURRENT_SENSOR':
      newState.sensor = (newState.sensor === action.sensor) ? null : action.sensor
      return newState

    case 'APPSTATE_SET_MAP_COORDS':
      newState.mapCoords = action.coords
      return newState

    case 'APPSTATE_SET_ID':
      newState.id = action.id
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

    case 'APPSTATE_SET_LANG':
      newState.lang = action.lang
      newState.phenomenonMeta.PM25.name = action.lang.particulateMatter + ' < 2.5µm'
      newState.phenomenonMeta.PM10.name = action.lang.particulateMatter + ' < 10µm'
      newState.phenomenonMeta.temperature.name = action.lang.temperature
      newState.phenomenonMeta.humidity.name = action.lang.humidity
      newState.phenomenonMeta.pressure.name = action.lang.pressure
      return newState

    default:
      return state
  }
}