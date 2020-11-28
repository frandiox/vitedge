const { getProjectInfo } = require('vite-ssr/config')

let commitHash
try {
  commitHash = require('child_process')
    .execSync('git rev-parse HEAD')
    .toString()
    .trim()
} catch (_) {}

module.exports = {
  ...getProjectInfo(),
  outDir: 'dist',
  clientOutDir: 'client',
  ssrOutDir: 'ssr',
  fnsInDir: 'functions',
  fnsOutFile: 'functions.js',
  commitHash,
}
