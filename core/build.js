const buildSSR = require('vite-ssr/build')

;(async () => {
  await buildSSR()

  // TODO build API

  process.exit()
})()
