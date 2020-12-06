const path = require('path')
const { rootDir, outDir, ssrOutDir, fnsOutFile } = require('./config.cjs')

module.exports = {
  entry: './index',
  target: 'webworker',
  resolve: {
    mainFields: ['main', 'module'],
    alias: {
      __vitedge_functions__: path.resolve(rootDir, outDir, fnsOutFile),
      __vitedge_router__: path.resolve(rootDir, outDir, ssrOutDir),
      __vitedge_meta__: path.resolve(
        rootDir,
        outDir,
        ssrOutDir,
        'package.json'
      ),
    },
  },
}
