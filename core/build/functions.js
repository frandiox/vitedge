import fg from 'fast-glob'
import { rollup } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import virtual from '@rollup/plugin-virtual'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import commonjs from '@rollup/plugin-commonjs'

function resolveFiles(globs, extensions) {
  return fg(
    globs.map((glob) => `${glob}.{${extensions.join(',')}}`),
    {
      ignore: ['node_modules', '.git'],
      onlyFiles: true,
    }
  )
}

export default async function ({ fnsInputPath, fnsOutputPath }) {
  const fnsRoutes = await resolveFiles(
    [
      fnsInputPath + '/*',
      fnsInputPath + '/api/**/*',
      fnsInputPath + '/props/**/*',
    ],
    ['js', 'ts']
  )

  const options = {
    input: 'entry',
    plugins: [
      virtual({
        entry:
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
            .join(',\n')} }`,
      }),
      esbuild(),
      nodeResolve({
        preferBuiltins: false,
        extensions: ['.mjs', '.js', '.json', '.node', '.ts'],
      }),
      commonjs(),
      json({ compact: true }),
    ],
  }

  const bundle = await rollup(options)
  await bundle.write({
    file: fnsOutputPath,
    format: 'es',
  })
}
