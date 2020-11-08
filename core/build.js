const buildSSR = require('vite-ssr/build')
const buildAPI = require('./api-build')

;(async () => {
  await buildSSR({
    clientOptions: {
      alias: {
        vitedge: 'vitedge/entry-client',
      },
    },
    ssrOptions: {
      alias: {
        vitedge: 'vitedge/entry-server',
      },
    },
  })

  await buildAPI()

  process.exit()
})()
