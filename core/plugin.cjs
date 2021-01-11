module.exports = {
  alias: {
    vitedge: 'vitedge/entry-client',
  },
  configureServer: [
    async ({
      root, // project root directory, absolute path
      app, // Koa app instance
      server, // raw http server instance
      watcher, // chokidar file watcher instance
    }) => {
      // -- Polyfill web APIs
      globalThis.fetch = require('node-fetch')
      globalThis.Request = globalThis.fetch.Request
      globalThis.Response = globalThis.fetch.Response
      globalThis.atob = (str) => Buffer.from(str, 'base64').toString('binary')
      globalThis.btoa = (str) => Buffer.from(str).toString('base64')
      globalThis.crypto = new (require('node-webcrypto-ossl').Crypto)()

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

      async function handleFunctionRequest(ctx, functionPath, extra) {
        try {
          const filePath = root + '/functions' + functionPath
          let endpointMeta = await import(
            filePath + '.js' + `?cacheBust=${cacheBust.get(filePath) || 0}`
          )

          if (endpointMeta) {
            endpointMeta = endpointMeta.default || endpointMeta
            if (endpointMeta.handler) {
              const fetchRequest = await nodeToFetchRequest(ctx.req)

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

              ctx.body = data

              return
            }
          }
        } catch (error) {
          console.error(error)
          ctx.message = error.message
          ctx.status = 500
          return
        }

        ctx.status = 404
      }

      app.use(async (ctx, next) => {
        if (ctx.url.includes('/api/')) {
          await handleFunctionRequest(ctx, ctx.url, {
            query: ctx.query,
            url: new URL(ctx.href),
          })

          return
        }

        if (ctx.url.includes('/props/')) {
          await handleFunctionRequest(
            ctx,
            ctx.query.propsGetter,
            ctx.query.data && JSON.parse(decodeURIComponent(ctx.query.data))
          )

          return
        }

        await next()
      })
    },
  ],
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
