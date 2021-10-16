import { promises as fs } from 'fs'
import { createRequire } from 'module'
import path from 'path'
import buildSSR from 'vite-ssr/build/index.js'
import buildFunctions from './functions.js'
import buildWorker from './worker.js'
import { meta, getProjectInfo } from '../config.js'
import { lookupFile } from '../utils/files.js'
import { getWranglerConfig } from '../utils/wrangler.js'
import { mergeConfig } from 'vite'

const {
  outDir,
  clientOutDir,
  ssrOutDir,
  fnsInDir,
  fnsOutFile,
  getCommitHash,
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
  const {
    getFramework,
    pluginOptions: {
      fnsOptions = {},
      workerOptions = {},
      clientOptions = {},
      ssrOptions = {},
    },
  } = viteConfig.plugins.find((plugin) => plugin.name === 'vitedge') || {}

  const { getPropsHandlerNames } = await buildFunctions({
    mode,
    watch,
    root: rootDir,
    fnsInputPath: path.resolve(rootDir, fnsInDir),
    fnsOutputPath: path.resolve(rootDir, outDir),
    fileName: fnsOutFile,
    options: fnsOptions,
  })

  const sep = '|'
  const plugins = [
    {
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
    },
  ]

  await buildSSR({
    clientOptions: mergeConfig(
      {
        mode,
        plugins,
        build: {
          watch,
          outDir: path.resolve(rootDir, outDir, clientOutDir),
        },
      },
      clientOptions
    ),
    serverOptions: mergeConfig(
      {
        mode,
        ssr: { target: 'webworker' },
        plugins,
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
            commitHash: getCommitHash(),
          },
        },
      },
      ssrOptions
    ),
  })

  if (getFramework() === 'react') {
    // FIXME This is a workaround related to @vite/plugin-react and type:module
    const ssrDistDirectory = path.resolve(rootDir, outDir, ssrOutDir)
    const require = createRequire(import.meta.url)
    const packageJson = require(path.join(ssrDistDirectory, 'package.json'))
    const serverBundlePath = path.join(ssrDistDirectory, packageJson.main)

    const serverBundle = await fs.readFile(serverBundlePath, 'utf-8')
    await fs.writeFile(
      serverBundlePath,
      serverBundle.replace('"react/jsx-runtime"', '"react/jsx-runtime.js"'),
      'utf-8'
    )
  }

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
