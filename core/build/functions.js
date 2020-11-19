import fg from 'fast-glob'
import { rollup } from 'rollup'
import virtual from '@rollup/plugin-virtual'

async function resolveFiles(dir, extensions) {
  return await fg(`${dir}/**/*.{${extensions.join(',')}}`, {
    ignore: ['node_modules', '.git'],
    onlyFiles: true,
  })
}

export default async function ({ fnsInputPath, fnsOutputPath }) {
  const fnsRoutes = await resolveFiles(fnsInputPath, ['js', 'ts'])

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
    ],
  }

  const bundle = await rollup(options)
  await bundle.write({
    file: fnsOutputPath,
    format: 'es',
  })
}
