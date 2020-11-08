const path = require('path')
const fg = require('fast-glob')
const { rollup } = require('rollup')
const virtual = require('@rollup/plugin-virtual')

async function resolveFiles(dir, extensions) {
  return await fg(`${dir}/**/*.{${extensions.join(',')}}`, {
    ignore: ['node_modules', '.git'],
    onlyFiles: true,
  })
}

module.exports = async function () {
  const apiDirectory = path.resolve(process.cwd(), 'api')
  const apiRoutes = await resolveFiles(apiDirectory, ['js', 'ts'])

  const options = {
    input: 'entry',
    plugins: [
      virtual({
        entry:
          apiRoutes
            .map((route, index) => `import dep${index} from '${route}'`)
            .join('\n') +
          '\n' +
          `export default { ${apiRoutes
            .map(
              (route, index) =>
                `"${route
                  .replace(apiDirectory + '/', '')
                  .replace(/\.[tj]sx?$/i, '')}": dep${index}`
            )
            .join(',\n')} }`,
      }),
    ],
  }

  const bundle = await rollup(options)
  await bundle.write({
    file: path.resolve(process.cwd(), 'dist', 'api.js'),
    format: 'es',
  })
}
