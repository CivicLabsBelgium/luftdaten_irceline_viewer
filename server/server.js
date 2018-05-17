const express = require('express')
const auto_ssl = require('auto-ssl-on-express-with-docker')
const path = require('path')
const httpAppBehaviour = [
  {
    method: 'get',
    path: '/token',
    cb: (req, res) => {
      const tilesAccessToken = process.env.TILES_ACCESS_TOKEN
      if (tilesAccessToken)
        res.json({tilesAccessToken})
      else
        res.status(404).json(
          {
            error: 'TILES_ACCESS_TOKEN was not set.'
          }
        )
    }
  },
  {
    method: 'use',
    args: [
      express.static(path.join(__dirname, 'build'))
    ]
  },
  {
    method: 'get',
    path: '*',
    cb: (req, res) => res.sendFile(path.resolve(__dirname, 'build/index.html'))
  }
]

const httpsApp = express()
httpAppBehaviour.map(({method, path, cb, args}) => {
  args ? httpsApp[method](...args) : httpsApp[method](path, cb)
})

auto_ssl(httpsApp, httpAppBehaviour)
