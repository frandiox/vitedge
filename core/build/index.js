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
  const root = rootDir instanceof Function ? rootDir() : rootDir

  await buildSSR({
    clientOptions: {
      outDir: path.resolve(root, outDir, clientOutDir),
      alias: {
        vitedge: 'vitedge/entry-client',
      },
    },
    ssrOptions: {
      outDir: path.resolve(root, outDir, ssrOutDir),
      alias: {
        vitedge: 'vitedge/entry-server',
      },
    },
  })

  await buildAPI({
    apiInputPath: path.resolve(root, apiInDir),
    apiOutputPath: path.resolve(root, outDir, apiOutFile),
  })

  process.exit()
}
