import { configureServer } from './dev/middleware.js'

export default () => {
  return {
    name: 'vitedge',
    configureServer,
    configResolved: (config) => {
      config.alias.push({
        find: /^vitedge$/,
        replacement: config.build.ssr
          ? 'vitedge/entry-server'
          : 'vitedge/entry-client',
      })
    },
  }
}
