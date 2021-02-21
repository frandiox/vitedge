const path = require('path')
const { rootDir, outDir, ssrOutDir, fnsOutFile } = require('./config.cjs')

module.exports = ({ root = rootDir } = {}) => ({
  entry: './index',
  target: 'webworker',
  resolve: {
    mainFields: ['main', 'module'],
    alias: {
      __vitedge_functions__: path.resolve(root, outDir, fnsOutFile),
      __vitedge_router__: path.resolve(root, outDir, ssrOutDir),
      __vitedge_meta__: path.resolve(root, outDir, ssrOutDir, 'package.json'),
    },
  },
})
