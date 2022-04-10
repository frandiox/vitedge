import viteSSR from 'vite-ssr/plugin.js'
import { configureServer, getRenderContext } from './dev/middleware.js'

const pluginName = 'vitedge'

export default (options = {}) => {
  let lib

  return [
    viteSSR({
      plugin: pluginName,
      getRenderContext,
      excludeSsrComponents: options.excludeSsrComponents,
    }),
    {
      name: pluginName,
      // Store for later
      pluginOptions: {
        clientOptions: options.client || {},
        ssrOptions: options.ssr || {},
        fnsOptions: options.functions || {},
        workerOptions: options.worker || {},
      },
      getFramework: () => lib,
      configureServer, // Provide API/Props during development
      config: ({ plugins }) => {
        const isVue = hasPlugin(plugins, 'vite:vue')
        const isReact =
          hasPlugin(plugins, 'vite:react') ||
          hasPlugin(plugins, 'react-refresh')

        lib = isVue ? 'vue' : isReact ? 'react' : 'core'

        return {
          optimizeDeps: {
            esbuildOptions: {
              // This is needed since Vite >= 2.6 to populate import.meta correctly
              target: 'es2020',
            },
          },
          ssr: {
            // This is required for Vite >= 2.7
            noExternal: [/vitedge/],
          },
        }
      },
    },
  ]
}

function hasPlugin(plugins, name) {
  return !!plugins.flat().find((plugin) => (plugin.name || '').startsWith(name))
}
