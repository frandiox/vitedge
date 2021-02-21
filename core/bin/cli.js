#!/usr/bin/env node

import cp from 'child_process'

const [, , ...args] = process.argv

const [command] = args

;(async () => {
  if (command === 'build') {
    const { default: build } = await import('vitedge/build/index.js')

    const modeIndex = args.indexOf('--mode')
    const mode = modeIndex >= 0 ? args[modeIndex + 1] : undefined

    await build({ mode })
    process.exit()
  } else if (
    command === 'dev' ||
    command === undefined ||
    command.startsWith('-')
  ) {
    const ssrIndex = args.indexOf('--ssr')
    if (ssrIndex >= 0) {
      args.splice(ssrIndex, 1)
      args.unshift('node_modules/.bin/vite-ssr', '--plugin', 'vitedge')
    } else {
      args.unshift('node_modules/.bin/vite')
    }

    const { default: config } = await import('vitedge/config.cjs')
    if (config.isTS) {
      args.unshift(
        '--loader',
        'vitedge/dev/ts-loader.js',
        '--experimental-specifier-resolution=node'
      )
    } else {
      args.unshift('--loader', 'vitedge/dev/js-loader.js')
    }

    args.unshift('--experimental-json-modules')

    cp.spawn('node', args, {
      stdio: [process.stdin, process.stdout, process.stderr],
    })
  } else {
    console.log(`Command "${command}" not supported`)
  }
})()
