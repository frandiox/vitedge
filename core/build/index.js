import path from 'path'
import buildSSR from 'vite-ssr/build.js'
import buildFunctions from './functions.js'

import config from '../config.cjs'

const {
  rootDir,
  outDir,
  clientOutDir,
  ssrOutDir,
  fnsInDir,
  fnsOutFile,
} = config

export default async function () {
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
