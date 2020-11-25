const fs = require('fs')
const path = require('path')

module.exports = {
  rootDir: process.cwd(),
  outDir: 'dist',
  clientOutDir: 'client',
  ssrOutDir: 'ssr',
  fnsInDir: 'functions',
  fnsOutFile: 'functions.js',
}
