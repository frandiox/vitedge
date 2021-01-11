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
      outDir: path.resolve(rootDir, outDir, clientOutDir),
      alias: {
        vitedge: 'vitedge/entry-client',
      },
    },
    ssrOptions: {
      mode,
      outDir: path.resolve(rootDir, outDir, ssrOutDir),
      alias: {
        vitedge: 'vitedge/entry-server',
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
