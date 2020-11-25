const fs = require('fs')
const path = require('path')

const systemRoot = path.parse(process.cwd()).root
const fileExists = (dir, file) => fs.existsSync(path.resolve(dir, file))

let rootDir
let currentDir = process.cwd()
let isTS = false

while (!rootDir && currentDir !== systemRoot) {
  if (fileExists(currentDir, 'vite.config.js')) {
    rootDir = currentDir
  } else if (fileExists(currentDir, 'vite.config.ts')) {
    isTS = true
    rootDir = currentDir
  } else {
    currentDir = path.resolve(currentDir, '..')
  }
}

if (!rootDir) {
  throw new Error(`Could not find Vite config file`)
}

module.exports = {
  isTS,
  rootDir,
  outDir: 'dist',
  clientOutDir: 'client',
  ssrOutDir: 'ssr',
  fnsInDir: 'functions',
  fnsOutFile: 'functions.js',
}
