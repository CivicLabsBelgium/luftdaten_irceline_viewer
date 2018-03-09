const defaultState = {
  zoom: 8,
  minZoom: 6,
  maxZoom: 14,
  lat: 50.843,
  lng: 4.368,
  maxBounds: [
    [60, -20],
    [40, 25]
  ],

  tilesURL: 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
  tilesAttribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a>',
  tilesID: 'mapbox.streets',
  tilesAccessToken: null,

  luftdatenURL1: 'https://api.luftdaten.info/v1/filter/country=BE',
  luftdatenURL2: '',

  showIrceline: true,

  showNearestIrcelineStation: true,
  nearestIrcelineStationRange: 30
}

export default function globalConfig (state = defaultState, action) {
  const newState = Object.assign({}, state)
  switch (action.type) {

    case 'GLOBALCONFIG_SET_TILES_ACCESS_TOKEN':
      newState.tilesAccessToken = action.tilesAccessToken
      return newState

    case 'GLOBALCONFIG_SET_CONFIG':
      Object.keys(action.config).forEach(
        configSetting => newState[configSetting] = action.config[configSetting]
      )
      return newState

    default:
      return state
  }
}