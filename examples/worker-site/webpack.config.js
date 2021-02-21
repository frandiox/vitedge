const path = require('path')
const vitedgeWebpack = require('../vue/node_modules/vitedge/webpack.cjs')

module.exports = {
  ...vitedgeWebpack({
    root: path.resolve(__dirname, '../vue'),
  }),
}
