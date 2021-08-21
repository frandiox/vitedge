import path from 'path'
import fg from 'fast-glob'
import { rollup as build, watch } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import alias from '@rollup/plugin-alias'
import { defineEnvVariables } from '../utils/env.js'
import { pathsToRoutes, routeToRegexp } from '../utils/api-routes.js'
import { printBundleResult } from './utils.js'

function resolveFiles(globs, extensions) {
  return fg(
    globs.map((glob) => `${glob}.{${extensions.join(',')}}`),
    {
      ignore: ['node_modules', '.git', '**/index.*'],
      onlyFiles: true,
    }
  )
}

export default function buildFunctions({
  mode,
  watch: shouldWatch,
  root,
  inDir,
  outDir,
  fileName,
  options = {},
  logger,
}) {
  return new Promise(async (resolve) => {
    const fnsInputPath = path.resolve(root, inDir)
    const fnsOutputPath = path.resolve(root, outDir)
    let fnsPaths = []

    const pathsToResolve = [
      fnsInputPath + '/*',
      fnsInputPath + '/api/**/*',
      fnsInputPath + '/props/**/*',
    ]

    const virtualEntryName = 'virtual:vitedge-functions'
    const generateVirtualEntryCode = async () => {
      fnsPaths = await resolveFiles(pathsToResolve, ['js', 'ts'])

      const { staticRoutes, dynamicRoutes } = pathsToRoutes(fnsPaths, {
        fnsInputPath,
      })

      return (
        fnsPaths
          .map((route, index) => `import dep${index} from '${route}'`)
          .join('\n') +
        '\n' +
        `export default {
       staticMap: new Map([${staticRoutes
         .map((route) => `["${route}", dep${route.index}]`)
         .join(',\n')}]),
       dynamicMap: new Map([${dynamicRoutes
         .map((route) => {
           const { keys, pattern } = routeToRegexp(route)

           return `[${pattern}, { keys: [${keys
             .map((key) => `"${key}"`)
             .join(',')}], value: dep${route.index} }]`
         })
         .join(',\n')}])
     }`
      )
    }

    // This is Vite options interface.
    // Turn it into pure Rollup options.
    const {
      rollupOptions: { output, ...bundleOptions } = {},
      commonjsOptions,
      minify = false, // This could be 'terser' or 'esbuild' in 0.15.0
      target = 'es2019',
    } = options.build || {}

    const rollupBuildOptions = {
      ...bundleOptions,
      input: virtualEntryName,
      plugins: [
        alias({ entries: options.resolve?.alias || [] }),
        replace({
          values: {
            ...(await defineEnvVariables({ mode })),
            ...options.define,
          },
          preventAssignment: true,
        }),
        esbuild({ minify: !!minify, target, ...options.esbuild }),
        nodeResolve({
          dedupe: options.resolve?.dedupe || [],
          exportConditions: options.resolve?.conditions || [],
          mainFields: options.resolve?.mainFields || ['module', 'main'],
          extensions: options.resolve?.extensions || [
            '.mjs',
            '.js',
            '.json',
            '.node',
            '.ts',
          ],
        }),
        commonjs(commonjsOptions),
        json({ compact: true, ...options.json }),
        {
          name: virtualEntryName,
          resolveId: (id) =>
            id === virtualEntryName ? virtualEntryName : undefined,
          load: (id) =>
            id === virtualEntryName ? generateVirtualEntryCode() : undefined,
          buildStart() {
            if (shouldWatch) {
              // Add new files to the watcher
              fg.sync(pathsToResolve, { dot: true }).forEach((filename) => {
                this.addWatchFile(filename)
              })
            }
          },
        },
        ...(options.plugins || []),
      ],
    }

    const rollupOutputOptions = {
      ...output,
      file: path.join(options.build?.outDir || fnsOutputPath, fileName),
      format: output?.format || 'es',
    }

    let shouldPrintResult = true
    const finishBundle = async (bundle) => {
      await bundle.write(rollupOutputOptions)
      await bundle.close()
      shouldPrintResult = true
      resolve({
        logFunctionsBuild: () => {
          if (shouldPrintResult) {
            printBundleResult(logger, outDir, fileName)
            shouldPrintResult = false
          }
        },
        getPropsHandlerNames: () =>
          fnsPaths
            .filter((filepath) => filepath.includes('/props/'))
            .map((filepath) =>
              filepath.split('/props/')[1].replace(/\.[jt]sx?$/, '')
            ),
      })
    }

    if (shouldWatch) {
      const watcher = watch({
        ...rollupBuildOptions,
        watch: {
          include: pathsToResolve,
          exclude: 'node_modules/**',
          skipWrite: true,
        },
      })

      watcher.on('event', ({ result }) => result && finishBundle(result))
    } else {
      await finishBundle(await build(rollupBuildOptions))
    }
  })
}
