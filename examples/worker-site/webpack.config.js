const path = require('path')

const lib = process.env.EXAMPLE_NAME
if (!lib) {
  throw new Error('Lib name was not set in EXAMPLE_NAME environment variable')
}

const vitedgeWebpack = require(`../${lib}/node_modules/vitedge/webpack.cjs`)

module.exports = {
  ...vitedgeWebpack({
    root: path.resolve(__dirname, `../${lib}`),
  }),
}
