import path from 'path'
import buildSSR from 'vite-ssr/build.js'
import buildFunctions from './functions.js'
import buildWorker from './worker.js'

import config from '../config.cjs'

const {
  getProjectInfo,
  outDir,
  clientOutDir,
  ssrOutDir,
  fnsInDir,
  fnsOutFile,
  workerOutFile,
  commitHash,
} = config

const { rootDir } = getProjectInfo()

export default async function ({ mode } = {}) {
  const ssrOutputPath = path.resolve(rootDir, outDir, ssrOutDir)

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
        outDir: ssrOutputPath,
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

  const fnsOutputPath = path.resolve(rootDir, outDir, fnsOutFile)

  await buildFunctions({
    mode,
    fnsInputPath: path.resolve(rootDir, fnsInDir),
    fnsOutputPath,
  })

  // TODO detect if wrangler.toml is present to do this conditionally
  await buildWorker({
    mode,
    workerInputPath: path.resolve(rootDir, fnsInDir, 'index.js'),
    workerOutputPath: path.resolve(rootDir, outDir, workerOutFile),
    fnsOutputPath,
    ssrOutputPath,
  })

  process.exit()
}
