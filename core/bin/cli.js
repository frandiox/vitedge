#!/usr/bin/env node

import path from 'path'
import { promises as fs } from 'fs'
import { createRequire } from 'module'
import cp from 'child_process'

const [, , command, ...args] = process.argv

;(async () => {
  if (command === 'build') {
    const { default: build } = await import('vitedge/build/index.js')

    const modeIndex = args.indexOf('--mode')
    const mode = modeIndex >= -1 ? args[modeIndex + 1] : undefined

    await build({ mode })
    process.exit()
  } else if (command === 'dev') {
    args.unshift('node_modules/.bin/vite')

    const { default: config } = await import('vitedge/config.cjs')
    if (config.isTS) {
      args.unshift(
        '--loader',
        'ts-node/esm',
        '--experimental-specifier-resolution=node'
      )
    }

    args.unshift('--experimental-json-modules')

    cp.spawn('node', args, {
      stdio: [process.stdin, process.stdout, process.stderr],
    })
  } else {
    console.log(`Command "${command}" not supported`)
  }
})()
