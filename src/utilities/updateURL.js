export function setParams (params) {

  const newParams = getParams()
  if (params.lat)
    newParams.lat = params.lat
  if (params.lng)
    newParams.lng = params.lng
  if (params.zoom)
    newParams.zoom = params.zoom

  window.location.hash = Object.keys(newParams).reduce(
    (string, param) => {
      const separator = (string !== '/?') ? '&' : ''
      if (param && newParams[param])
        return string.concat(separator + param + '=' + newParams[param])
      else
        return string
    },
    '/?'
  )
}

export function getParams () {
  const hash = window.location.hash.split('#/?')[1] || ''
  return hash.split('&').reduce(
    (params, currentPair) => {
      const pair = currentPair.split('=')
      let newParams = params
      newParams[pair[0]] = pair[1]
      return newParams
    },
    {}
  )
}