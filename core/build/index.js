const path = require('path')
const buildSSR = require('vite-ssr/build')
const buildAPI = require('./api')

const {
  rootDir,
  outDir,
  clientOutDir,
  ssrOutDir,
  apiInDir,
  apiOutFile,
} = require('../config')

module.exports = async () => {
  await buildSSR({
    clientOptions: {
      outDir: path.resolve(rootDir, outDir, clientOutDir),
      alias: {
        vitedge: 'vitedge/entry-client',
      },
    },
    ssrOptions: {
      outDir: path.resolve(rootDir, outDir, ssrOutDir),
      alias: {
        vitedge: 'vitedge/entry-server',
      },
    },
  })

  await buildAPI({
    apiInputPath: path.resolve(rootDir, apiInDir),
    apiOutputPath: path.resolve(rootDir, outDir, apiOutFile),
  })

  process.exit()
}
