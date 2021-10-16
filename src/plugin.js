import viteSSR from 'vite-ssr/plugin.js'
import { configureServer, getRenderContext } from './dev/middleware.js'

const pluginName = 'vitedge'
const entryServer = '/entry-server'
const entryClient = '/entry-client'

export default (options = {}) => {
  let lib

  return [
    viteSSR({
      plugin: pluginName,
      getRenderContext,
    }),
    {
      name: pluginName,
      fnsOptions: options.functions || {}, // Store for later
      workerOptions: options.worker || {}, // Store for later
      getFramework: () => lib,
      configureServer, // Provide API/Props during development
      config: ({ plugins, server }, env) => {
        const isVue = hasPlugin(plugins, 'vite:vue')
        const isReact =
          hasPlugin(plugins, 'vite:react') ||
          hasPlugin(plugins, 'react-refresh')

        lib = isVue ? 'vue' : isReact ? 'react' : 'core'

        return {
          define: {
            // Vite 2.6.0 bug: use this
            // instead of import.meta
            __DEV__: env.mode !== 'production',
            __HOT__: (server || {}).hmr !== false,
          },
        }
      },
      configResolved: (config) => {
        const libPath = `/${lib}`

        // config.alias is pre-beta.69
        ;(config.resolve.alias || config.alias).push({
          find: /^vitedge(\/vue|\/react)?$/,
          replacement:
            pluginName +
            libPath +
            (config.build.ssr ? entryServer : entryClient),
          _viteSSR: true,
        })

        config.optimizeDeps = config.optimizeDeps || {}
        config.optimizeDeps.include = config.optimizeDeps.include || []
        config.optimizeDeps.include.push(
          pluginName + libPath + entryClient,
          pluginName + libPath + entryServer
        )
      },
    },
  ]
}

function hasPlugin(plugins, name) {
  return !!plugins.flat().find((plugin) => (plugin.name || '').startsWith(name))
}
