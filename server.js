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

const httpPort = process.env.NODE_ENV === 'development' ? 8080 : 80
const httpsPort = process.env.NODE_ENV === 'development' ? 8443 : 443

const app = express()

//endpoint for letsencrypt / certbot challenges
app.get('/.well-known/acme-challenge/:fileName', (req, res) => {
  const filePath = path.join(__dirname, '.well-known/acme-challenge/', req.params.fileName)
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath)
  } else {
    console.warn('Certbot requested file does not exist. server.https will not reboot')
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
    getNewCertificates()

    /// try to initiate letsencrypt / certbot
    // const generate_ssl_certificate_script = spawn('.', ['/generate_ssl_certificate.sh'], {cwd: '/', shell: true})
  }
)

//////////// HTTPS PORT 443

// start the https server

// function setHttpsServer () {
//   try {
//
//     const dom = process.env.DOMAINNAME
//     const sub = process.env.SUBDOMAIN
//     const certOptions = {}
//
//     if (sub && dom) {
//       console.log('checking for Letsencrypt/certbot  certificate...')
//       certOptions.key = fs.readFileSync('/etc/letsencrypt/live/' + sub + '.' + dom + '/privkey.pem', 'utf8')
//       certOptions.cert = fs.readFileSync('/etc/letsencrypt/live/' + sub + '.' + dom + '/cert.pem', 'utf8')
//       console.log('got letsencrypt ssl certificate')
//     } else {
//       console.log('checking for local certificate...') //// add your .key and .crt files in the ssl folder if you are not using let'sencrypt
//       certOptions.key = fs.readFileSync(path.resolve('ssl/server.key'))
//       certOptions.cert = fs.readFileSync(path.resolve('ssl/server.crt'))
//       console.log('got local ssl certificate')
//       try {
//         fs.watch(path.resolve('ssl/server.key'), () => {
//           console.log('watched a file')
//         })
//       } catch (e) {}
//     }
//
//     server.https = https.createServer(certOptions, app)
//     server.https.listen(httpsPort, () => {
//         console.log('listening on https port ' + httpsPort)
//       }
//     )
//   } catch (e) {
//     console.warn('(optional) https server failed to initiate: could not find certificate in /ssl')
//   }
// }

let certificate, certPath = process.env.NODE_ENV === 'production' && process.env.DOMAINNAME && process.env.SUBDOMAIN ? '/etc/letsencrypt/live/' + process.env.DOMAINNAME + '.' + process.env.SUBDOMAIN : 'ssl'

function readCertificate () {
  try {
    return {
      key: fs.readFileSync(`${certPath}/privkey.pem`, 'utf8'),
      cert: fs.readFileSync(`${certPath}/cert.pem`, 'utf8')
    }
  } catch ( e ) {
    console.warn('Could not find certificate in ' + certPath)
  }
}

function createHttpsServer () {
  server.https = require('https').createServer(certificate, app)
  server.https.listen(httpsPort, function () {
    console.log(`https server running on port ${httpsPort}.`)
  })
}

let watching = false
function watchCertificateFiles () { // watch certificate file for change (renewal) and update server when it does
  try {
    fs.watch(`${certPath}/privkey.pem`, () => {
      const newKey = fs.readFileSync(`${certPath}/privkey.pem`, 'utf8'),
        newCert = fs.readFileSync(`${certPath}/cert.pem`, 'utf8')
      certificate = {
        key: newKey,
        cert: newCert
      }
      server.https._sharedCreds.context.setCert(newCert)
      server.https._sharedCreds.context.setKey(newKey)
    })
    watching = true
  } catch ( e ) {
    // files don't exist yet
  }
}

certificate = readCertificate()
if ( certificate ) {
  createHttpsServer()
  watchCertificateFiles()
}

function getNewCertificates () {
  const initServer = spawn('.', ['/generate_ssl_certificate.sh'], {cwd: '/', shell: true})
  console.log('running generate_ssl_certificate.sh')

  initServer.stdout.on('data', (data) => {
    console.log(data.toString())
  })

  initServer.stderr.on('data', (data) => {
    console.log(data.toString())
  })

  initServer.on('close', (code) => {
    console.log(`initcert.sh exited with code ${code}. 0 means it worked`)
    if ( !server.https ) createHttpsServer()
    if ( !watching ) watchCertificateFiles()
  })
}



// setHttpsServer()