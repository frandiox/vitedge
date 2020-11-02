const buildSSR = require('vite-ssr/build')
const buildAPI = require('./api-build')

;(async () => {
  await buildSSR({
    clientOptions: {
      alias: {
        vueflare: 'vueflare/entry-client',
      },
    },
    ssrOptions: {
      alias: {
        vueflare: 'vueflare/entry-server',
      },
    },
  })

  await buildAPI()

  process.exit()
})()
