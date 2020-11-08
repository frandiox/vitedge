const fs = require('fs')
const path = require('path')

const viteConfigName = 'vite.config.js'

let rootDir = process.cwd()
if (!fs.existsSync(path.resolve(rootDir, viteConfigName))) {
  rootDir = path.resolve(process.cwd(), '..')
  if (!fs.existsSync(path.resolve(rootDir, viteConfigName))) {
    throw new Error(`Could not find ${viteConfigName}`)
  }
}

module.exports = {
  rootDir,
  outDir: 'dist',
  clientOutDir: 'client',
  ssrOutDir: 'ssr',
  apiInDir: 'api',
  apiOutFile: 'api.js',
}
