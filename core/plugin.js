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
      const cacheBust = new Map()
      watcher.on('change', (fullPath) => {
        if (fullPath.replace(root, '').startsWith('/functions/')) {
          const filePath = fullPath.replace(/\.[jt]sx?$/i, '')
          cacheBust.set(filePath, (cacheBust.get(filePath) || 0) + 1)
        }
      })

      async function handleFunctionRequest(ctx, functionPath) {
        try {
          const filePath = root + '/functions' + functionPath
          let endpointMeta = await import(
            filePath + '.js' + `?cacheBust=${cacheBust.get(filePath) || 0}`
          )

          if (endpointMeta) {
            endpointMeta = endpointMeta.default || endpointMeta
            if (endpointMeta.handler) {
              const { data } = await endpointMeta.handler({
                request: ctx.request,
                query: ctx.query,
                body: ctx.request.body,
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
