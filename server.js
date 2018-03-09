// server requirements

const express = require('express')
const path = require('path')
const fs = require('fs')
const https = require('https')
const http = require('http')
const {spawn} = require('child_process')

const server = {
  http: null,
  https: null
}

const httpPort = process.env.NODE_ENV === 'production' ? 80 : 8080
const httpsPort = process.env.NODE_ENV === 'production' ? 443 : 8443

const app = express()

//endpoint for letsencrypt / certbot challenges
app.get('/.well-known/acme-challenge/:fileName', (req, res) => {
  const filePath = path.join(__dirname, '.well-known/acme-challenge/', req.params.fileName)
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath)
    setTimeout(() => {
      setHttpsServer()
    }, 5000)
    console.log('Restarting httpsServer in 5 seconds...')
  } else {
    console.log('Certbot requested file does not exist. httpsServer will not reboot')
    res.status(400).send() // Bad request
  }
})

// Serve token from env
app.get('/token', function (req, res) {
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

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')))
app.get('*', function (req, res) {
  res.sendFile(path.resolve(__dirname, 'build/index.html'))
})

//////////// HTTP PORT 80

// port 80 for certificate renewal

server.http = http.createServer(app)

server.http.listen(httpPort, () => {
    console.log('listening on http port ' + httpPort)

    /// try to initiate letsencrypt / certbot
    const generate_ssl_certificate_script = spawn('.', ['/generate_ssl_certificate.sh'], {cwd: '/', shell: true})

    /// log the script's output
    generate_ssl_certificate_script.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`)
    })

    generate_ssl_certificate_script.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`)
    })

    generate_ssl_certificate_script.on('close', (code) => {
      console.log(`init_server.sh exited with code ${code}`)
    })
  }
)

//////////// HTTPS PORT 443

// start the https server

function setHttpsServer () {
  try {

    const dom = process.env.DOMAINNAME
    const sub = process.env.SUBDOMAIN
    const certOptions = {}

    if (sub && dom) {
      console.log('checking for Letsencrypt/certbot  certificate...')
      certOptions.key = fs.readFileSync('/etc/letsencrypt/live/' + sub + '.' + dom + '/privkey.pem', 'utf8')
      certOptions.cert = fs.readFileSync('/etc/letsencrypt/live/' + sub + '.' + dom + '/cert.pem', 'utf8')
      console.log('got letsencrypt ssl certificate')
    } else {
      console.log('checking for local certificate...') //// add your .key and .crt files in the ssl folder if you are not using let'sencrypt
      certOptions.key = fs.readFileSync(path.resolve('ssl/server.key'))
      certOptions.cert = fs.readFileSync(path.resolve('ssl/server.crt'))
      console.log('got local ssl certificate')
    }

    server.https = https.createServer(certOptions, app)
    server.https.listen(httpsPort, () => {
        console.log('listening on https port ' + httpsPort)
      }
    )
  } catch (e) {
    console.warn('(optional) https server failed to initiate: could not find certificate in /ssl')
  }
}

setHttpsServer()