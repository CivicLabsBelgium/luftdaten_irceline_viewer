
// modules
const express = require('express')
const path = require('path')
const Irceline = require('./irceline')
const Luftdaten = require('./luftdaten')

const irceline = new Irceline()
const luftdaten = new Luftdaten()

const app = express()

app.get('/token', (req, res) => {
    const tilesAccessToken = process.env.TILES_ACCESS_TOKEN
    if (tilesAccessToken) {
        res.json({ tilesAccessToken })
    } else {
        res.status(404).json(
            {
                error: 'TILES_ACCESS_TOKEN was not set.'
            }
        )
    }
})

app.get('/irceline', (req, res) => {
    res.setHeader('Surrogate-Control', 'no-store')
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    res.json({
        timeStamp: irceline.dataTimeStamp,
        length: irceline.data.length,
        data: irceline.data
    })
})
app.get('/luftdaten', (req, res) => {
    res.setHeader('Surrogate-Control', 'no-store')
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    res.json({
        timeStamp: luftdaten.dataTimeStamp,
        length: luftdaten.data.length,
        data: luftdaten.data
    })
})

app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, 'build/index.html')))
app.use(express.static(path.join(__dirname, 'build')))

app.listen(80)
