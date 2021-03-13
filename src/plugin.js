import { configureServer, getRenderContext } from './dev/middleware.js'

const name = 'vitedge'

export default () => {
  return {
    name,
    configureServer, // Provide API/Props during development
    configResolved: (config) => {
      let lib = '/vue' // default

      const file = config.build.ssr ? '/entry-server' : '/entry-client'

      // config.alias is pre-beta.69
      ;(config.resolve.alias || config.alias).push({
        find: /^vitedge$/,
        replacement: name + lib + file,
      })
    },
    viteSsr: {
      getRenderContext, // Provide props during SSR development
    },
  }
}
