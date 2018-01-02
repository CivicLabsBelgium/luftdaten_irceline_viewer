import React from 'react'

export function fetch_json (url) {
  return new Promise((resolve, reject) => {
      fetch(url).then(
        data => data.json().then((json) => {
            resolve(json)
          },
        ).catch(() => {
          reject('no valid response')
        })
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

/**
 * usage: array.filter( generic_functions.array_unique )
 * @param value
 * @param index
 * @param self
 * @returns {boolean}
 */
export function array_unique (value, index, self) {
  return self.indexOf(value) === index
}

export function createMarkerIconSVG (options) {
  const ReactDOMServer = require('react-dom/server')
  return (
    ReactDOMServer.renderToStaticMarkup(
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" height={options.size} width={options.size}>
        <path stroke={options.borderColor} strokeWidth="1" fill={options.borderColor}
              d="m0.794361,40.000002l16.802418,-39.275629l44.806445,0l16.802413,39.275629l-16.802413,39.275629l-44.806445,0l-16.802418,-39.275629z"/>
        <polygon fill={options.color}
                 d="m1.48022,39.877484l16.505781,-38.610012l44.015413,0l16.505776,38.610012l-16.505776,38.610012l-44.015413,0l-16.505781,-38.610012z"/>
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


//TODO remove and implement hexgrid library
export function snapToGrid (latlng, map, size) {

  const latlngInPxCoords = map.latLngToLayerPoint(latlng)

  let latSnappedPxCoords = Math.floor(latlngInPxCoords.x - latlngInPxCoords.x % (size*1.5))
  let lngSnappedPxCoords = Math.floor(latlngInPxCoords.y - latlngInPxCoords.y % (size * 0.5))


  if (lngSnappedPxCoords % (size)) {
    latSnappedPxCoords += size * 0.145

  }
  if (latSnappedPxCoords % (size*0.5)) {
    latSnappedPxCoords += size*0.6
  }

  // latSnappedPxCoords+= size*0.5

  latSnappedPxCoords = Math.floor(latSnappedPxCoords)
  lngSnappedPxCoords = Math.floor(lngSnappedPxCoords)


  console.log(
    latlngInPxCoords.y,
    lngSnappedPxCoords
  )

  latlng = map.layerPointToLatLng([latSnappedPxCoords, lngSnappedPxCoords])

  return latlng
}