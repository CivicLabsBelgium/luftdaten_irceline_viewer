const createCORSRequest = function (method, url) {
  let xhr = new XMLHttpRequest()
  if ('withCredentials' in xhr) {
    // Most browsers.
    xhr.open(method, url, true)
  } else if (typeof XDomainRequest !== 'undefined') {
    // IE8 & IE9
    xhr = new XDomainRequest()
    xhr.open(method, url)
  } else {
    // CORS not supported.
    xhr = null
  }
  return xhr
}

export default function makeRequest (options) {
  return new Promise((resolve, reject) => {
    const xhr = createCORSRequest(options.method, options.url)

    for (let k in options.headers) {
      xhr.setRequestHeader(k, options.headers[k])
    }

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response && JSON.parse(xhr.response))
      } else {
        reject(xhr.statusText)
      }
    }
    xhr.onerror = async function () {
      reject(xhr.statusText)
    }
    xhr.send(JSON.stringify(options.data))
  })
}