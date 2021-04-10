import path from 'path'
import buildSSR from 'vite-ssr/build.js'
import buildFunctions from './functions.js'

import config from '../config.cjs'

const {
  getProjectInfo,
  outDir,
  clientOutDir,
  ssrOutDir,
  fnsInDir,
  fnsOutFile,
  commitHash,
} = config

const { rootDir } = getProjectInfo()

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
        target: 'es2019', // Support Node 12
        rollupOptions: {
          output: {
            format: 'es',
          },
        },
      },
      packageJson: {
        type: 'module',
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
