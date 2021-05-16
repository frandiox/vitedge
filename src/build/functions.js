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
import regexparam from 'regexparam'
import rsort from 'route-sort'

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
  const fnsRoutes = await resolveFiles(
    [
      fnsInputPath + '/*',
      fnsInputPath + '/api/**/*',
      fnsInputPath + '/props/**/*',
    ],
    ['js', 'ts']
  )

  const stringRoutes = []
  const regexpRoutes = []

  for (let i = 0; i < fnsRoutes.length; i++) {
    let route = new String(
      fnsRoutes[i].replace(fnsInputPath, '').replace(/\.[tj]sx?$/i, '')
    )

    if (/\[/.test(route)) {
      let wild
      route = new String(
        route
          .replace(/\[\.\.\.([\w-]+)\]/, (_, s1) => {
            wild = s1
            return '*'
          })
          .replace(/\[\[([\w-]+)\]\]/g, ':$1?')
          .replace(/\[([\w-]+)\]/g, ':$1')
      )

      route.wild = wild
      route.index = i
      regexpRoutes.push(route)
    } else {
      route.index = i
      stringRoutes.push(route)
    }
  }

  const virtualEntry =
    fnsRoutes
      .map((route, index) => `import dep${index} from '${route}'`)
      .join('\n') +
    '\n' +
    `export default {
       strings: { ${stringRoutes
         .map((route) => `"${route}": dep${route.index}`)
         .join(',\n')} },
       regexps: new Map([${rsort(regexpRoutes)
         .map((route) => {
           const { keys, pattern } = regexparam(route)

           // Rename wildcards to match file name
           if (route.wild) {
             const i = keys.indexOf('wild')
             keys[i] = route.wild
           }

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
        values: resolveEnvVariables({ mode }),
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
}
