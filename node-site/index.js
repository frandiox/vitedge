global.fetch = require('node-fetch')
const path = require('path')
const express = require('express')
const { request } = require('http')
const { default: handler } = require('../example/dist/ssr/src/main')
const api = require('../example/dist/api')

const server = express()

server.use(
  '/_assets',
  express.static(path.join(__dirname, '../example/dist/client/_assets'))
)

server.use(
  '/favicon.ico',
  express.static(path.join(__dirname, '../example/dist/client/favicon.ico'))
)

server.get('*', async (req, res) => {
  if (req.path.startsWith('/api/')) {
    console.log('api', req.query)
    const apiHandler = api[req.path.replace('/api/', '')]

    if (apiHandler) {
      return res.end(JSON.stringify(apiHandler({ request: req })))
    } else {
      // Error
      return res.end('{}')
    }
  }

  const url = req.protocol + '://' + req.get('host') + req.originalUrl
  const { html } = await handler({ ...request, url })
  res.end(html)
})

const port = 8080
console.log(`Server started: http://localhost:${port}`)
server.listen(port)
