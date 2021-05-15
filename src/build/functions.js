import fg from 'fast-glob'
import { rollup } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import virtual from '@rollup/plugin-virtual'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import { resolveEnvVariables } from './env.js'
import regexparam from 'regexparam'

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
}) {
  const fnsRoutes = await resolveFiles(
    [
      fnsInputPath + '/*',
      fnsInputPath + '/api/**/*',
      fnsInputPath + '/props/**/*',
    ],
    ['js', 'ts']
  )

  const regexpRoutes = []
  const stringRoutes = []
  for (let i = 0; i < fnsRoutes.length; i++) {
    let route = fnsRoutes[i]
      .replace(fnsInputPath, '')
      .replace(/\.[tj]sx?$/i, '')

    if (/\/_|\[/.test(route)) {
      route = route
        .replace(/\[\.\.\.[\w-]+\]/g, '*')
        .replace(/\[\[([\w-]+)\]\]/g, ':$1?')
        .replace(/\[([\w-]+)\]/g, ':$1')

      regexpRoutes.push([route, i])
    } else {
      stringRoutes.push([route, i])
    }
  }

  const virtualEntry =
    fnsRoutes
      .map((route, index) => `import dep${index} from '${route}'`)
      .join('\n') +
    '\n' +
    `export default {
       strings: { ${stringRoutes
         .map(([route, index]) => `"${route}": dep${index}`)
         .join(',\n')} },
       regexps: new Map([${regexpRoutes
         .map(([route, index]) => {
           const { keys, pattern } = regexparam(route)
           return `[${pattern}, { keys: [${keys
             .map((key) => `"${key}"`)
             .join(',')}], value: dep${index} }]`
         })
         .join(',\n')}])
     }`

  const bundle = await rollup({
    input: 'entry',
    plugins: [
      virtual({ entry: virtualEntry }),
      replace({
        values: resolveEnvVariables({ mode }),
        preventAssignment: true,
      }),
      esbuild(),
      nodeResolve({
        preferBuiltins: false,
        extensions: ['.mjs', '.js', '.json', '.node', '.ts'],
      }),
      commonjs(),
      json({ compact: true }),
    ],
  })

  await bundle.write({
    file: fnsOutputPath,
    format: 'es',
  })
}
