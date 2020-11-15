const path = require('path')
const buildSSR = require('vite-ssr/build')
const buildFunctions = require('./functions')

const {
  rootDir,
  outDir,
  clientOutDir,
  ssrOutDir,
  fnsInDir,
  fnsOutFile,
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

  await buildFunctions({
    fnsInputPath: path.resolve(rootDir, fnsInDir),
    fnsOutputPath: path.resolve(rootDir, outDir, fnsOutFile),
  })

  process.exit()
}
