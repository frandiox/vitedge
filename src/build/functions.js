import fg from 'fast-glob'
import { rollup } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import virtual from '@rollup/plugin-virtual'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import alias from '@rollup/plugin-alias'
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

  const virtualEntry =
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

  const { rollupOptions: { output, ...bundleOptions } = {}, resolve = {} } =
    options

  const bundle = await rollup({
    ...bundleOptions,
    input: 'entry',
    plugins: [
      virtual({ entry: virtualEntry }),
      alias({ entries: resolve.alias || [] }),
      replace({
        values: await resolveEnvVariables({ mode }),
        preventAssignment: true,
      }),
      esbuild(options.esbuild),
      nodeResolve({
        dedupe: resolve.dedupe || [],
        exportConditions: resolve.conditions || [],
        mainFields: resolve.mainFields || ['module', 'main'],
        extensions: resolve.extensions || [
          '.mjs',
          '.js',
          '.json',
          '.node',
          '.ts',
        ],
      }),
      commonjs(options.commonjsOptions),
      json({ compact: true, ...options.json }),
      ...(options.plugins || []),
    ],
  })

  await bundle.write({
    ...output,
    file: fnsOutputPath,
    format: 'es',
  })

  return {
    propsHandlerNames: fnsPaths
      .filter((filepath) => filepath.includes('/props/'))
      .map((filepath) =>
        filepath.split('/props/')[1].replace(/\.[jt]sx?$/, '')
      ),
  }
}
