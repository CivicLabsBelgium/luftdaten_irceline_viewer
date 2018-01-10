import React from 'react'
import store from '../redux/store'
import { setReachable } from '../redux/stationUpdates/actions'


//TODO refactor?
export function fetch_json (url, source) {
  return new Promise((resolve, reject) => {
      fetch(url).then(
        data => data.json().then((json) => {
            resolve(json)
          },
        ).catch(() => {
          reject('no valid response')
          store.dispatch(setReachable(false, source))
        })
      ).catch(
        () => {
          store.dispatch(setReachable(false, source))
        }
      )
    }
  )
}

/**
 * usage: array.sort( generic_functions.sort_raw_data_by_timestamp )
 * @param rawData1
 * @param rawData2
 * @returns {boolean}
 */
export function sort_raw_data_by_timestamp (rawData1, rawData2) {
  return rawData1.timestamp > rawData2.timestamp
}


export function createMarkerIconSVG (options) {
  const ReactDOMServer = require('react-dom/server')
  const border = (options.hexagonIsSelected === false) ? null : <path stroke="#000" fill="#000"
                                                                      d="M70.35,3,92.83,41.62,70.64,80.4,26,80.57,3.46,42,25.66,3.17,70.35,3m1.72-3L23.92.18,0,42,24.23,83.58l48.15-.18L96.3,41.61,72.07,0Z"/>

  //TODO test return normal string

  return (
    ReactDOMServer.renderToStaticMarkup(
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96.3 83.58" height={options.size} width={options.size}>
        <polygon fill={options.color}
                 points="1.73 41.96 24.79 1.68 71.21 1.5 94.56 41.62 71.51 81.9 25.09 82.07 1.73 41.96"/>
        {border}
      </svg>)

  )
}

export function colorToRgba (hexColor, alpha) {

  const color = hexColor.substr(1)
  let rgba = [
    parseInt(color[0] + color[1], 16), // red
    parseInt(color[2] + color[3], 16), // green
    parseInt(color[4] + color[5], 16), // blue
    alpha                              // alpha
  ]
  return 'rgba(' + rgba.join(', ') + ')'
}

//TODO cleaner grid with no gaps and overlaps
export function snapToGrid (latlng, map, size) {

  const xOffset = 0.72
  const yOffset = 0.83

  const latlngInPxCoords = map.latLngToLayerPoint(latlng)

  let latSnappedPxCoords = (latlngInPxCoords.x - latlngInPxCoords.x % (size * xOffset)) // X
  let lngSnappedPxCoords = (latlngInPxCoords.y - latlngInPxCoords.y % (size * yOffset)) // Y

  if (latSnappedPxCoords % (size * xOffset * 2) === 0) {
    lngSnappedPxCoords += (size * yOffset) / 2
  }

  latSnappedPxCoords = Math.floor(latSnappedPxCoords)
  lngSnappedPxCoords = Math.floor(lngSnappedPxCoords)

  latlng = map.layerPointToLatLng([latSnappedPxCoords, lngSnappedPxCoords])

  return latlng
}