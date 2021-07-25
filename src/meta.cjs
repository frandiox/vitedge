let commitHash
try {
  commitHash = require('child_process')
    .execSync('git rev-parse HEAD')
    .toString()
    .trim()
} catch (_) {}

const meta = {
  outDir: 'dist',
  clientOutDir: 'client',
  ssrOutDir: 'ssr',
  fnsInDir: 'functions',
  fnsOutFile: 'functions.js',
  workerInFile: 'index.js',
  workerOutFile: 'bundle.js',
}

module.exports = {
  ...meta,
  commitHash,
  resolveAliases: (rootDir) => {
    const path = require('path')

    return {
      __vitedge_functions__: path.resolve(
        rootDir,
        meta.outDir,
        meta.fnsOutFile
      ),
      __vitedge_router__: path.resolve(rootDir, meta.outDir, meta.ssrOutDir),
      __vitedge_meta__: path.resolve(
        rootDir,
        meta.outDir,
        meta.ssrOutDir,
        'package.json'
      ),
    }
  },
}
