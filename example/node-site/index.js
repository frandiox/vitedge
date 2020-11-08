global.fetch = require('node-fetch')
const path = require('path')
const express = require('express')

const { default: handler } = require('../dist/ssr/src/main')
const api = require('../dist/api')

const server = express()

server.use(
  '/_assets',
  express.static(path.join(__dirname, '../dist/client/_assets'))
)

server.use(
  '/favicon.ico',
  express.static(path.join(__dirname, '../dist/client/favicon.ico'))
)

server.get('*', async (req, res) => {
  if (req.path.startsWith('/api/')) {
    console.log('api', req.query)
    const apiHandler = api[req.path.replace('/api/', '')]

    if (apiHandler) {
      return res.end(
        JSON.stringify(apiHandler({ request: req, params: req.query }))
      )
    } else {
      // Error
      return res.end('{}')
    }
  }

  const url = req.protocol + '://' + req.get('host') + req.originalUrl
  const { html } = await handler({ request: { ...req, url }, api })
  res.end(html)
})

const port = 8080
console.log(`Server started: http://localhost:${port}`)
server.listen(port)
