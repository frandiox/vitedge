import path from 'path'
import buildSSR from 'vite-ssr/build/index.js'
import buildFunctions from './functions.js'

import { meta, getProjectInfo } from '../config.js'

const { outDir, clientOutDir, ssrOutDir, fnsInDir, fnsOutFile, commitHash } =
  meta

export default async function ({ mode = 'production', ssr } = {}) {
  const { config, rootDir } = await getProjectInfo(mode)
  const { fnsOptions = {} } =
    config.plugins.find((plugin) => plugin.name === 'vitedge') || {}

  const { propsHandlerNames } = await buildFunctions({
    mode,
    fnsInputPath: path.resolve(rootDir, fnsInDir),
    fnsOutputPath: path.resolve(rootDir, outDir, fnsOutFile),
    options: fnsOptions.build,
  })

  const sep = '|'
  const propsFnReplacer = {
    'globalThis.__AVAILABLE_PROPS_ENDPOINTS__': JSON.stringify(
      sep + propsHandlerNames.join(sep) + sep
    ),
  }

  await buildSSR({
    clientOptions: {
      mode,
      define: propsFnReplacer,
      build: {
        outDir: path.resolve(rootDir, outDir, clientOutDir),
      },
    },
    serverOptions: {
      mode,
      ssr: { target: 'webworker' },
      define: propsFnReplacer,
      build: {
        ssr,
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

  process.exit()
}
