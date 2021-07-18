import path from 'path'
import fg from 'fast-glob'
import { build } from 'vite'
import { promises as fs } from 'fs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { resolveEnvVariables } from './env.js'
import { pathsToRoutes, routeToRegexp } from '../utils/api-routes.js'

function resolveFiles(globs, extensions) {
  return fg(
    globs.map((glob) => `${glob}.{${extensions.join(',')}}`),
    {
      ignore: ['node_modules', '.git', '**/index.*'],
      onlyFiles: true,
    }
  )
}

export default async function buildFunctions({
  mode,
  fnsInputPath,
  fnsOutputPath,
  fileName,
  options = {},
}) {
  const fnsPaths = await resolveFiles(
    [
      fnsInputPath + '/*',
      fnsInputPath + '/api/**/*',
      fnsInputPath + '/props/**/*',
    ],
    ['js', 'ts']
  )

  const { staticRoutes, dynamicRoutes } = pathsToRoutes(fnsPaths, {
    fnsInputPath,
  })

  const virtualEntryCode =
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

  await build({
    ...options,
    root: fnsInputPath,
    configFile: false,
    envFile: false,
    resolve: {
      ...options.resolve,
      mainFields,
      extensions,
    },
    plugins: [
      {
        name: virtualEntryName,
        resolveId: (id) =>
          id === virtualEntryName ? virtualEntryName : undefined,
        load: (id) => (id === virtualEntryName ? virtualEntryCode : undefined),
        async config() {
          return {
            define: await resolveEnvVariables({ mode }),
          }
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
      ...options.build,
      rollupOptions: {
        ...options.build?.rollupOptions,
        input: virtualEntryName,
      },
      lib: {
        entry: virtualEntryName,
        formats: [format],
        fileName: fileName.replace('.js', ''),
      },
    },
  })

  // Vite lib adds the format to the extension. Remove it here.
  await fs.rename(
    path.resolve(outDir, fileName.replace('.js', `.${format}.js`)),
    path.resolve(outDir, fileName)
  )

  return {
    propsHandlerNames: fnsPaths
      .filter((filepath) => filepath.includes('/props/'))
      .map((filepath) =>
        filepath.split('/props/')[1].replace(/\.[jt]sx?$/, '')
      ),
  }
}
