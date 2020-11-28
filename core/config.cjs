const { getProjectInfo } = require('vite-ssr/config')

module.exports = {
  ...getProjectInfo(),
  outDir: 'dist',
  clientOutDir: 'client',
  ssrOutDir: 'ssr',
  fnsInDir: 'functions',
  fnsOutFile: 'functions.js',
}
