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
      // @ts-ignore
      globalThis.fetch = require('node-fetch')
      require('multienv-loader').load({
        mode: process.env.NODE_ENV || 'development',
        envPath: root + '/functions',
      })

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
              const { data } = await endpointMeta.handler({
                ...(extra || {}),
                request: ctx.request,
                headers: ctx.headers,
                event: {
                  clientId: process.pid,
                  request: ctx.request,
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
