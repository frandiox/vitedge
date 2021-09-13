const meta = {
  outDir: 'dist',
  clientOutDir: 'client',
  ssrOutDir: 'ssr',
  fnsInDir: 'functions',
  fnsOutFile: 'functions.js',
  workerOutDir: 'worker',
  workerOutFile: 'script.js',
  nodeOutFile: 'bundle.js',
}

module.exports = {
  ...meta,
  getCommitHash: () => {
    try {
      return require('child_process')
        .execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
        .toString()
        .trim()
    } catch (_) {
      return (Math.random() + 1).toString(36).substring(2)
    }
  },
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
