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
      (await fs.readFile(viteConfigLoader, 'utf8'))
        // Use native ESM to import config file instead of Rollup
        .replace(
          /(\w+)\s+=\s+require\(resolvedPath\)/,
          '$1 = await import(resolvedPath); $1 = $1.default || $1'
        )
        // Ignore TS check to keep using native ESM with ts-node instead of Rollup
        .replace(
          /if\s+\(!isTS\)/i,
          'if (!isTS || process[Symbol.for("ts-node.register.instance")])'
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

    const { default: config } = await import('vitedge/config.cjs')
    if (config.isTS) {
      args.unshift('--loader', 'ts-node/esm')
    }

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
