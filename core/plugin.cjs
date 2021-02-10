module.exports = () => {
  return {
    name: 'vitedge',
    configResolved: (config) => {
      config.alias.push({
        find: /^vitedge$/,
        replacement: config.build.ssr
          ? 'vitedge/entry-server'
          : 'vitedge/entry-client',
      })
    },
    configureServer: ({ app, config, watcher }) => {
      // -- Polyfill web APIs
      globalThis.fetch = require('node-fetch')
      globalThis.Request = globalThis.fetch.Request
      globalThis.Response = globalThis.fetch.Response
      globalThis.atob = (str) => Buffer.from(str, 'base64').toString('binary')
      globalThis.btoa = (str) => Buffer.from(str).toString('base64')
      globalThis.crypto = new (require('node-webcrypto-ossl').Crypto)()

      const { root } = config

      // -- Load environment variables
      require('multienv-loader').load({
        mode: process.env.NODE_ENV || 'development',
        envPath: root + '/functions',
      })

      // -- Prepare HMR for backend files
      const cacheBust = new Map()
      watcher.on('change', (fullPath) => {
        if (fullPath.replace(root, '').startsWith('/functions/')) {
          const filePath = fullPath.replace(/\.[jt]sx?$/i, '')
          cacheBust.set(filePath, (cacheBust.get(filePath) || 0) + 1)
        }
      })

      async function handleFunctionRequest(req, res, { functionPath, extra }) {
        try {
          const filePath = root + '/functions' + functionPath
          let endpointMeta = await import(
            filePath + '.js' + `?cacheBust=${cacheBust.get(filePath) || 0}`
          )

          if (endpointMeta) {
            endpointMeta = endpointMeta.default || endpointMeta
            if (endpointMeta.handler) {
              const fetchRequest = await nodeToFetchRequest(req)

              const { data } = await endpointMeta.handler({
                ...(extra || {}),
                request: fetchRequest,
                headers: fetchRequest.headers,
                event: {
                  clientId: process.pid,
                  request: fetchRequest,
                  respondWith: () => undefined,
                  waitUntil: () => undefined,
                },
              })

              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              return res.end(JSON.stringify(data))
            }
          }
        } catch (error) {
          console.error(error)
          res.statusMessage = error.message
          res.statusCode = 500
          return res.end()
        }

        res.statusCode = 404
        return res.end()
      }

      app.use('/api', async function vitedgeApiHandler(req, res) {
        const url = getUrl(req)
        await handleFunctionRequest(req, res, {
          functionPath: req.originalUrl,
          extra: {
            query: url.searchParams,
            url,
          },
        })
      })

      app.use('/props', async function vitedgePropsHandler(req, res) {
        const { searchParams } = getUrl(req)
        await handleFunctionRequest(req, res, {
          functionPath: searchParams.get('propsGetter'),
          extra: searchParams.has('data')
            ? JSON.parse(decodeURIComponent(searchParams.get('data')))
            : {},
        })
      })
    },
  }
}

function getUrl(req) {
  const secure =
    req.connection.encrypted || req.headers['x-forwarded-proto'] === 'https'

  return new URL(
    `${secure ? 'https' : 'http'}://${req.headers.host + req.originalUrl}`
  )
}

function nodeToFetchRequest(nodeRequest) {
  return new Promise((resolve, reject) => {
    let data = []
    nodeRequest.on('data', (chunk) => data.push(chunk))
    nodeRequest.on('error', (error) => reject(error))
    nodeRequest.on('end', () => {
      // Simulate a FetchEvent.request https://developer.mozilla.org/en-US/docs/Web/API/Request
      resolve(
        new Request(
          `${nodeRequest.protocol || 'http'}://${nodeRequest.headers.host}${
            nodeRequest.url
          }`,
          {
            ...nodeRequest,
            body: data.length === 0 ? undefined : Buffer.concat(data),
          }
        )
      )
    })
  })
}
