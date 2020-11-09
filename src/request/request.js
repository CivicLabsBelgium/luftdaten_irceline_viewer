const request = (options) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(options.method || 'get', options.url)

    for (const k in options.headers) {
      xhr.setRequestHeader(k, options.headers[k])
    }

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.response))
        } catch (error) {
          resolve(xhr.response)
        }
      } else {
        reject(xhr.statusText)
      }
    }
    xhr.onerror = () => {
      reject(xhr.statusText)
    }
    xhr.send(JSON.stringify(options.data))
  })
}

export default request
