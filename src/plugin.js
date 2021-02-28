import { configureServer, getRenderContext } from './dev/middleware.js'

export default () => {
  return {
    name: 'vitedge',
    configureServer, // Provide API/Props during development
    configResolved: (config) => {
      // Vite-beta>=69 wraps 'alias' in 'resolve'
      ;(config.resolve.alias || config.alias).push({
        find: /^vitedge$/,
        replacement: config.build.ssr
          ? 'vitedge/entry-server'
          : 'vitedge/entry-client',
      })
    },
    viteSsr: {
      getRenderContext, // Provide props during SSR development
    },
  }
}
