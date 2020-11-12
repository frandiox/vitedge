const path = require('path')
const { rootDir, outDir, ssrOutDir, fnsOutFile } = require('./config')

module.exports = {
  entry: './index',
  target: 'webworker',
  resolve: {
    mainFields: ['main', 'module'],
    alias: {
      __vitedge_router__: path.resolve(rootDir, outDir, ssrOutDir, 'src/main'),
      __vitedge_functions__: path.resolve(rootDir, outDir, fnsOutFile),
    },
  },
}
