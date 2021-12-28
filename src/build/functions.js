import fg from 'fast-glob'
import { build } from 'vite'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { defineEnvVariables } from '../utils/env.js'
import { resolveFunctionsFiles } from '../utils/files.js'
import { pathsToRoutes, routeToRegexp } from '../utils/api-routes.js'

export default function buildFunctions({
  mode,
  watch,
  root,
  fnsInputPath,
  fnsOutputPath,
  fileName,
  options = {},
}) {
  return new Promise(async (resolve) => {
    let fnsPaths = []
    const returnPayload = {
      getPropsHandlerNames: () =>
        fnsPaths
          .filter((filepath) => filepath.includes('/props/'))
          .map((filepath) =>
            filepath.split('/props/')[1].replace(/\.[jt]sx?$/, '')
          ),
    }

    const pathsToResolve = [
      fnsInputPath + '/*',
      fnsInputPath + '/api/**/*',
      fnsInputPath + '/props/**/*',
    ]

    const generateVirtualEntryCode = async () => {
      fnsPaths = await resolveFunctionsFiles(pathsToResolve)

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

    const virtualEntryName = 'virtual:vitedge-functions'
    const format = options.build?.rollupOptions?.output?.format || 'es'
    const outDir = options.build?.outDir || fnsOutputPath
    const mainFields = options.resolve?.mainFields || ['module', 'main']
    const extensions = options.resolve?.mainFields || [
      '.mjs',
      '.js',
      '.json',
      '.node',
      '.ts',
    ]

    const fnsResult = await build({
      ...options,
      root,
      configFile: false,
      envFile: false,
      publicDir: false,
      resolve: {
        ...options.resolve,
        mainFields,
        extensions,
      },
      plugins: [
        {
          name: virtualEntryName,
          resolveId: (id) =>
            // Vite 2.7 is prefixing the virtual entry name with the project path
            id.includes(virtualEntryName) ? virtualEntryName : undefined,
          load: (id) =>
            id === virtualEntryName ? generateVirtualEntryCode() : undefined,
          async config() {
            return {
              define: await defineEnvVariables({ mode }),
            }
          },
          buildStart() {
            if (watch) {
              // Add new files to the watcher
              fg.sync(pathsToResolve, { dot: true }).forEach((filename) => {
                this.addWatchFile(filename)
              })
            }
          },
          generateBundle(options, bundle) {
            // Vite lib-build adds the format to the extension.
            // This renames the output file.
            const [[key, value]] = Object.entries(bundle)
            delete bundle[key]
            value.fileName = fileName
            bundle[fileName] = value
            options.entryFileNames = fileName
          },
        },
        // This shouldn't be required but Vite
        // cannot import TS files with .js extension
        // without adding this extra plugin.
        nodeResolve({
          mainFields,
          extensions,
          dedupe: options.resolve?.dedupe || [],
          exportConditions: options.resolve?.conditions || [],
        }),
        ...(options.plugins || []),
      ],
      build: {
        outDir,
        minify: false,
        target: 'es2019',
        emptyOutDir: false,
        ...options.build,
        rollupOptions: {
          ...options.build?.rollupOptions,
          input: virtualEntryName,
        },
        lib: {
          entry: virtualEntryName,
          formats: [format],
          fileName,
        },
        watch: watch
          ? { include: pathsToResolve, exclude: 'node_modules/**' }
          : undefined,
      },
    })

    const isWatching = Object.prototype.hasOwnProperty.call(
      fnsResult,
      '_maxListeners'
    )

    if (isWatching) {
      fnsResult.on('event', async ({ result }) => {
        if (result) {
          result.close()
          resolve(returnPayload)
        }
      })
    } else {
      resolve(returnPayload)
    }
  })
}
