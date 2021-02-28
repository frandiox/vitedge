const path = require('path')
const {
  getProjectInfo,
  outDir,
  ssrOutDir,
  fnsOutFile,
} = require('./config.cjs')

module.exports = ({ root } = {}) => {
  if (!root) {
    root = getProjectInfo().rootDir
  }

  return {
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
  }
}
