import fg from 'fast-glob'
import { rollup } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import virtual from '@rollup/plugin-virtual'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import { loadEnv } from '../utils/env.js'

function resolveFiles(globs, extensions) {
  return fg(
    globs.map((glob) => `${glob}.{${extensions.join(',')}}`),
    {
      ignore: ['node_modules', '.git'],
      onlyFiles: true,
    }
  )
}

function resolveEnvVariables({ mode }) {
  const actualMode = mode || process.env.NODE_ENV || 'production'

  const envVariables = loadEnv({
    mode: actualMode,
    dry: true,
  })

  const nodeEnv = envVariables.NODE_ENV || process.env.NODE_ENV || actualMode

  return {
    'process.env.MODE': JSON.stringify(actualMode),
    'process.env.NODE_ENV': JSON.stringify(nodeEnv),
    ...Object.entries(envVariables).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [`process.env.${key}`]: JSON.stringify(value),
      }),
      {}
    ),
    'process.env.': `({}).`,
    'process.env': JSON.stringify(envVariables),
  }
}

export default async function ({ mode, fnsInputPath, fnsOutputPath }) {
  const fnsRoutes = await resolveFiles(
    [
      fnsInputPath + '/*',
      fnsInputPath + '/api/**/*',
      fnsInputPath + '/props/**/*',
    ],
    ['js', 'ts']
  )

  const virtualEntry =
    fnsRoutes
      .map((route, index) => `import dep${index} from '${route}'`)
      .join('\n') +
    '\n' +
    `export default { ${fnsRoutes
      .map(
        (route, index) =>
          `"${route
            .replace(fnsInputPath, '')
            .replace(/\.[tj]sx?$/i, '')}": dep${index}`
      )
      .join(',\n')} }`

  const bundle = await rollup({
    input: 'entry',
    plugins: [
      virtual({ entry: virtualEntry }),
      replace(resolveEnvVariables({ mode })),
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
