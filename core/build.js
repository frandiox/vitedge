const buildSSR = require('vite-ssr/build')
const buildAPI = require('./api-build')

;(async () => {
  await buildSSR()

  await buildAPI()

  process.exit()
})()
