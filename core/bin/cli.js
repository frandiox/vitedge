#!/usr/bin/env node

import path from 'path'
import { promises as fs } from 'fs'
import { createRequire } from 'module'
import cp from 'child_process'

const [, , command, ...args] = process.argv

const patchVite = async () => {
  const require = createRequire(import.meta.url)
  const vitePath = path.dirname(require.resolve('vite/package.json'))
  const viteConfigLoader = path.resolve(vitePath, 'dist/node/config.js')

  try {
    await fs.writeFile(
      viteConfigLoader,
      (await fs.readFile(viteConfigLoader, 'utf8')).replace(
        /\srequire\(resolvedPath\)/,
        ' await import(resolvedPath); config = config.default || config'
      )
    )
  } catch (error) {
    console.warn('Vitedge could not patch Vite:', error.message)
  }
}

;(async () => {
  if (command === 'build') {
    const { default: build } = await import('vitedge/build/index.js')
    await build()
    process.exit()
  } else if (command === 'dev') {
    args.unshift('node_modules/.bin/vite')

    cp.spawn('node', args, {
      stdio: [process.stdin, process.stdout, process.stderr],
    })
  } else if (command === 'patch') {
    await patchVite()
    process.exit()
  } else {
    console.log(`Command "${command}" not supported`)
  }
})()
