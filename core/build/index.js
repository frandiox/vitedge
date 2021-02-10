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
  commitHash,
} = config

export default async function ({ mode } = {}) {
  await buildSSR({
    clientOptions: {
      mode,
      build: {
        outDir: path.resolve(rootDir, outDir, clientOutDir),
      },
    },
    serverOptions: {
      mode,
      build: {
        outDir: path.resolve(rootDir, outDir, ssrOutDir),
      },
      packageJson: {
        vitedge: {
          commitHash,
        },
      },
    },
  })

  await buildFunctions({
    mode,
    fnsInputPath: path.resolve(rootDir, fnsInDir),
    fnsOutputPath: path.resolve(rootDir, outDir, fnsOutFile),
  })

  process.exit()
}
