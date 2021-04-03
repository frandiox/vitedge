import { configureServer, getRenderContext } from './dev/middleware.js'

const name = 'vitedge'
const viteSsrName = 'vite-ssr'
const entryServer = '/entry-server'
const entryClient = '/entry-client'

export default () => {
  return {
    name,
    configureServer, // Provide API/Props during development
    configResolved: (config) => {
      let lib = '/vue' // default

      if (
        config.plugins.findIndex((plugin) => plugin.name === 'react-refresh') >=
        0
      ) {
        lib = '/react'
      }

      // config.alias is pre-beta.69
      ;(config.resolve.alias || config.alias).push({
        find: /^vitedge$/,
        replacement:
          name + lib + (config.build.ssr ? entryServer : entryClient),
      })

      config.optimizeDeps = config.optimizeDeps || {}
      config.optimizeDeps.include = config.optimizeDeps.include || []
      config.optimizeDeps.include.push(
        name + lib + entryClient,
        name + lib + entryServer,
        viteSsrName + lib + entryClient,
        viteSsrName + lib + entryServer
      )
    },
    viteSsr: {
      getRenderContext, // Provide props during SSR development
    },
  }
}
