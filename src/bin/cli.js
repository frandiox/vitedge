#!/usr/bin/env node

import cp from 'child_process'

const [, , ...args] = process.argv

const options = {}
for (let i = 0; i < args.length; i++) {
  const arg = args[i]
  const nextArg = args[i + 1]
  if (arg.startsWith('--')) {
    options[arg.replace('--', '')] =
      !nextArg || nextArg.startsWith('--') ? true : nextArg
  }
}

const [command] = args

;(async () => {
  if (command === 'build') {
    const { default: build } = await import('vitedge/build/index.js')

    await build({
      mode: typeof options.mode === 'string' ? options.mode : undefined,
      ssr: typeof options.ssr === 'string' ? options.ssr : undefined,
      watch: !!options.watch,
      entry: options.entry,
    })

    if (!options.watch) {
      process.exit()
    }
  } else if (
    command === 'dev' ||
    command === undefined ||
    command.startsWith('-')
  ) {
    if (options.ssr) {
      if (typeof options.ssr !== 'string') {
        // Remove --ssr if there is no path specified
        args.splice(args.indexOf('--ssr'), 1)
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
