import path from 'path'
import buildSSR from 'vite-ssr/build/index.js'
import buildFunctions from './functions.js'
import buildWorker from './worker.js'
import { meta, getProjectInfo } from '../config.js'
import { lookupFile } from '../utils/files.js'
import { getWranglerConfig } from '../utils/wrangler.js'

const {
  outDir,
  clientOutDir,
  ssrOutDir,
  fnsInDir,
  fnsOutFile,
  commitHash,
  workerOutDir,
  workerOutFile,
  nodeOutFile,
} = meta

export default async function ({
  mode = 'production',
  ssr,
  watch,
  entry,
  worker,
  ...workerFlags
} = {}) {
  const { config: viteConfig, rootDir } = await getProjectInfo(mode)
  const { fnsOptions = {}, workerOptions = {} } =
    viteConfig.plugins.find((plugin) => plugin.name === 'vitedge') || {}

  const { getPropsHandlerNames, logFunctionsBuild } = await buildFunctions({
    mode,
    watch,
    root: rootDir,
    logger: viteConfig.logger,
    inDir: fnsInDir,
    outDir,
    fileName: fnsOutFile,
    options: fnsOptions,
  })

  const sep = '|'
  const propsReplacerPlugin = {
    name: 'vitedge-props-replacer',
    transform(code, id) {
      // Use `transform` hook for replacing variables because `config`
      // hook is not retriggered on watcher events.
      if (id.endsWith('/vitedge/utils/props.js')) {
        watch && this.addWatchFile(path.resolve(rootDir, outDir, fnsOutFile))
        return code.replace(
          'globalThis.__AVAILABLE_PROPS_ENDPOINTS__',
          JSON.stringify(sep + getPropsHandlerNames().join(sep) + sep)
        )
      }
    },
  }

  await buildSSR({
    clientOptions: {
      mode,
      plugins: [propsReplacerPlugin],
      build: {
        watch,
        outDir: path.resolve(rootDir, outDir, clientOutDir),
      },
    },
    serverOptions: {
      mode,
      ssr: { target: 'webworker' },
      plugins: [{ ...propsReplacerPlugin, writeBundle: logFunctionsBuild }],
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

  if (entry === undefined || entry === true) {
    const defaultEntry = lookupFile({
      dir: path.resolve(rootDir, fnsInDir),
      formats: ['js', 'ts', 'mjs'].map((ext) => 'index.' + ext),
      pathOnly: true,
      bubble: false,
    })

    entry = defaultEntry || false
  }

  if (entry) {
    const wranglerConfig = await getWranglerConfig(viteConfig)
    const isWorker = !!(worker || wranglerConfig)

    if (isWorker && wranglerConfig.type !== 'javascript') {
      // Do not build script when using Webpack
      return
    }

    await buildWorker({
      ...workerFlags,
      watch,
      esbuildOptions: workerOptions.build,
      inputPath: entry,
      viteConfig,
      platform: isWorker ? 'worker' : 'node',
      fileName: isWorker ? workerOutFile : nodeOutFile,
      outputPath: isWorker ? path.join(outDir, workerOutDir) : outDir,
    })
  }
}
