#!/usr/bin/env node

import cp from 'child_process'

const [, , ...args] = process.argv

function parseOptions({ onlyStringArgs = [] } = {}) {
  const options = {}
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    const nextArg = args[i + 1]
    if (arg.startsWith('--')) {
      const isBoolean = !nextArg || nextArg.startsWith('--')
      const argName = arg.replace('--', '')
      if (isBoolean && onlyStringArgs.includes(argName)) {
        throw new Error(
          `Value of argument "${argName}" must be a string. E.g. ${arg} <string>`
        )
      }

      options[argName.replace(/-([a-z])/i, (_, s1) => s1.toUpperCase())] =
        isBoolean ? true : nextArg
    }
  }

  return options
}

const [command] = args

;(async () => {
  if (command === 'build') {
    const { default: build } = await import('vitedge/build/index.js')
    const options = parseOptions({ onlyStringArgs: ['ssr', 'mode', 'entry'] })

    await build(options)

    if (!options.watch) {
      process.exit()
    }
  } else if (command === 'preview') {
    const { default: preview } = await import('vitedge/build/preview.js')
    const options = parseOptions({
      onlyStringArgs: ['ssr', 'mode', 'entry', 'wrangler', 'port'],
    })

    await preview(options)
  } else if (
    command === 'dev' ||
    command === undefined ||
    command.startsWith('-')
  ) {
    const options = parseOptions({ onlyStringArgs: ['mode'] })

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
