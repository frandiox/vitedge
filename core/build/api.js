const fg = require('fast-glob')
const { rollup } = require('rollup')
const virtual = require('@rollup/plugin-virtual')

async function resolveFiles(dir, extensions) {
  return await fg(`${dir}/**/*.{${extensions.join(',')}}`, {
    ignore: ['node_modules', '.git'],
    onlyFiles: true,
  })
}

module.exports = async function ({ apiInputPath, apiOutputPath }) {
  const apiRoutes = await resolveFiles(apiInputPath, ['js', 'ts'])

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
                  .replace(apiInputPath, '')
                  .replace(/\.[tj]sx?$/i, '')}": dep${index}`
            )
            .join(',\n')} }`,
      }),
    ],
  }

  const bundle = await rollup(options)
  await bundle.write({
    file: apiOutputPath,
    format: 'es',
  })
}
