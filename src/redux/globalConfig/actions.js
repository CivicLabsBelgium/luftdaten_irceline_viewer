export function setTilesAccessToken (tilesAccessToken) {
  console.log('setting token: ', tilesAccessToken)
  return {
    type: 'GLOBALCONFIG_SET_TILES_ACCESS_TOKEN',
    tilesAccessToken
  }
}

export function setConfig (config) {
  return {
    type: 'GLOBALCONFIG_SET_CONFIG',
    config
  }
}