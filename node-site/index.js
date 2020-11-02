global.fetch = require('node-fetch')
const path = require('path')
const express = require('express')
const { request } = require('http')
const { default: handler } = require('../example/dist/ssr/src/main')

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
  if (req.path.startsWith('/api/state')) {
    console.log('api', req.query)
    res.end(
      JSON.stringify({
        server: true,
        msg: 'This is page ' + (req.query.name || '').toUpperCase(),
      })
    )
  }

  const url = req.protocol + '://' + req.get('host') + req.originalUrl
  const { html } = await handler({ ...request, url })
  res.end(html)
})

const port = 8080
console.log(`Server started: http://localhost:${port}`)
server.listen(port)
