export function setParams (params) {

  if (typeof params.id !== 'undefined') {
    delete params.lat
    delete params.lng
  } else {
    delete params.id
  }

  console.log(params)

  window.location.hash = Object.keys(params).reduce(
    (string, param) => {
      const separator = (string !== '/?') ? '&' : ''
      if (param && params[param])
        return string.concat(separator + param + '=' + params[param])
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
      if (pair.length !== 2)
        return params
      let newParams = params
      newParams[pair[0]] = pair[1]
      return newParams
    },
    {}
  )
}