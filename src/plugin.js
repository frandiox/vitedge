import viteSSR from 'vite-ssr/plugin.js'
import { configureServer, getRenderContext } from './dev/middleware.js'

const pluginName = 'vitedge'
const entryServer = '/entry-server'
const entryClient = '/entry-client'

export default (options = {}) => {
  let framework

  return [
    viteSSR({
      plugin: pluginName,
      getRenderContext,
    }),
    {
      name: pluginName,
      fnsOptions: options.functions, // Store for later
      getFramework: () => framework,
      configureServer, // Provide API/Props during development
      configResolved: (config) => {
        framework = 'vue'

        if (
          config.plugins.findIndex(
            (plugin) => plugin.name === 'react-refresh'
          ) >= 0
        ) {
          framework = 'react'
        }

        const lib = '/' + framework

        // config.alias is pre-beta.69
        ;(config.resolve.alias || config.alias).push({
          find: /^vitedge(\/vue|\/react)?$/,
          replacement:
            pluginName + lib + (config.build.ssr ? entryServer : entryClient),
          _viteSSR: true,
        })

        config.optimizeDeps = config.optimizeDeps || {}
        config.optimizeDeps.include = config.optimizeDeps.include || []
        config.optimizeDeps.include.push(
          pluginName + lib + entryClient,
          pluginName + lib + entryServer
        )
      },
    },
  ]
}
