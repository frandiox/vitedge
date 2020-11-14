#!/usr/bin/env node

const [, , command, ...args] = process.argv

;(async () => {
  if (command === 'build') {
    const { default: build } = await import('vitedge/build/index.js')
    await build()
    process.exit()
  } else {
    console.log(`Command "${command}" not supported`)
  }
})()
