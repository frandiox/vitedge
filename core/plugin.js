import viteSSRPlugin from 'vite-ssr/plugin.js'

export default {
  ...viteSSRPlugin,
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
      async function handleFunctionRequest(ctx, functionPath) {
        try {
          const filePath = root + '/functions' + functionPath + '.js'
          const cacheBust = `?cacheBust=${Math.random().toString(36).substr(2)}`
          let endpointMeta = await import(filePath + cacheBust)

          if (endpointMeta) {
            endpointMeta = endpointMeta.default || endpointMeta
            if (endpointMeta.handler) {
              ctx.body = await endpointMeta.handler({
                request: ctx.request,
                query: ctx.query,
                body: ctx.request.body,
              })

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
          await handleFunctionRequest(ctx, ctx.url)
          return
        }

        if (ctx.url.includes('/props/')) {
          await handleFunctionRequest(ctx, ctx.query.propsGetter)
          return
        }

        await next()
      })
    },
  ],
}
