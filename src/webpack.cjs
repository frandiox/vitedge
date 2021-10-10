const fs = require('fs')
const path = require('path')
const { resolveAliases } = require('./meta.cjs')

function findRootDirSync() {
  function fileExists(dir, file) {
    try {
      fs.accessSync(path.resolve(dir, file))
      return true
    } catch (_) {
      return false
    }
  }

  let rootDir
  const systemRoot = path.parse(process.cwd()).root

  let currentDir = process.cwd()
  while (!rootDir && currentDir !== systemRoot) {
    if (fileExists(currentDir, 'vite.config.js')) {
      rootDir = currentDir
    } else if (fileExists(currentDir, 'vite.config.mjs')) {
      rootDir = currentDir
    } else if (fileExists(currentDir, 'vite.config.ts')) {
      rootDir = currentDir
    } else {
      currentDir = path.resolve(currentDir, '..')
    }
  }

  if (!rootDir) {
    throw new Error(`Could not find Vite config file`)
  }

  return rootDir
}

module.exports = ({ root } = {}) => {
  if (!root) {
    root = findRootDirSync()
  }

  let isReact = false
  try {
    require.resolve('@vitejs/plugin-react')
    isReact = true
  } catch (error) {
    try {
      require.resolve('@vitejs/plugin-react-refresh')
      isReact = true
    } catch (error) {}
  }

  return {
    entry: './index',
    target: 'webworker',
    resolve: {
      mainFields: isReact
        ? // Webpack defaults for webworker https://webpack.js.org/configuration/resolve/#resolvemainfields
          ['browser', 'module', 'main']
        : // Vue crashes when importing 'module' before 'main'
          ['browser', 'main', 'module'],
      alias: resolveAliases(root),
    },
  }
}
