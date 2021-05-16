import path from 'path'
import { resolveConfig } from 'vite'
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

export default async function ({ mode = 'production' } = {}) {
  const config = await resolveConfig(mode)
  const { fnsOptions = {} } =
    config.plugins.find((plugin) => plugin.name === 'vitedge') || {}

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
    options: fnsOptions.build,
  })

  process.exit()
}
