const path = require('path')
const fs = require('fs').promises

// TODO This whole process should be done using Rollup

module.exports = async function () {
  const stateFile = await fs.readFile(
    path.resolve(process.cwd(), 'src', 'api', 'state.js'),
    {
      encoding: 'utf-8',
    }
  )

  // TODO change to ESM
  const apiFile = `
    module.exports = {
      'state': ${stateFile.replace('export default', '')}
    }
  `

  await fs.writeFile(path.resolve(process.cwd(), 'dist', 'api.js'), apiFile)
}
