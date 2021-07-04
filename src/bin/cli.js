#!/usr/bin/env node

import cp from 'child_process'

const [, , ...args] = process.argv

const [command] = args

const ssrIndex = args.indexOf('--ssr')
const modeIndex = args.indexOf('--mode')

;(async () => {
  if (command === 'build') {
    const { default: build } = await import('vitedge/build/index.js')

    const mode = modeIndex >= 0 ? args[modeIndex + 1] : undefined
    const ssr = ssrIndex >= 0 ? args[ssrIndex + 1] : undefined

    await build({ mode, ssr })
    process.exit()
  } else if (
    command === 'dev' ||
    command === undefined ||
    command.startsWith('-')
  ) {
    if (ssrIndex >= 0) {
      if ((args[ssrIndex + 1] || '-').startsWith('-')) {
        // Remove --ssr if there is no path specified
        args.splice(ssrIndex, 1)
      }

      args.unshift('node_modules/.bin/vite-ssr')
    } else {
      args.unshift('node_modules/.bin/vite')
    }

    const { getProjectInfo } = await import('vitedge/config.js')
    const { isTS } = await getProjectInfo()

    args.unshift(
      '--loader',
      isTS ? 'vitedge/dev/ts-loader.js' : 'vitedge/dev/js-loader.js'
    )

    args.unshift('--experimental-json-modules')
    args.unshift('--experimental-specifier-resolution=node')

    cp.spawn('node', args, {
      stdio: [process.stdin, process.stdout, process.stderr],
    })
  } else {
    console.log(`Command "${command}" not supported`)
  }
})()
