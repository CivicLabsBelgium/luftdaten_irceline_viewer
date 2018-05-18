const express = require('express')
const auto_ssl = require('auto-ssl-on-express-with-docker')
const path = require('path')

const app = express()
app.get('/token', (req, res) => {
  const tilesAccessToken = process.env.TILES_ACCESS_TOKEN
  if (tilesAccessToken)
    res.json({tilesAccessToken})
  else
    res.status(404).json(
      {
        error: 'TILES_ACCESS_TOKEN was not set.'
      }
    )
})
app.use(express.static(path.join(__dirname, 'build')))
app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'build/index.html')))
auto_ssl(app, app)
