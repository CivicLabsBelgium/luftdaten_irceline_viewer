
// modules
const express = require('express')
const path = require('path')
const Irceline = require('./irceline')
const Luftdaten = require('./luftdaten')

const irceline = new Irceline()
const luftdaten = new Luftdaten()

// environment variables
const noSSL = process.env.NODE_ENV !== 'production'
const email = process.env.SSL_EMAIL || ''
const approvedDomains = (process.env.SSL_DOMAINS || '').split(',')

const app = express()

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next()
})

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

app.use(express.static(path.join(__dirname, 'build')))
app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'build/index.html')))

if (!noSSL) {
    const greenLock = require('greenlock-express')
    console.log('using greenlock')
    greenLock.create({

        // Let's Encrypt v2 is ACME draft 11
        version: 'draft-11',

        server: 'https://acme-v02.api.letsencrypt.org/directory',
        // Note: If at first you don't succeed, stop and switch to staging
        // https://acme-staging-v02.api.letsencrypt.org/directory

        // You MUST change this to a valid email address
        email,

        // You MUST NOT build clients that accept the ToS without asking the user
        agreeTos: true,

        // You MUST change these to valid domains
        // NOTE: all domains will validated and listed on the certificate
        approvedDomains,

        // You MUST have access to write to directory where certs are saved
        // ex: /home/foouser/acme/etc
        configDir: '/etc/greenlock/acme/',

        app,

        // Get notified of important updates and help me make greenlock better
        communityMember: false

        //, debug: true

    }).listen(80, 443)
} else {
    console.log('not using greenlock')
    app.listen(8080)
}
