const viteSSRPlugin = require('vite-ssr/plugin')

module.exports = {
  ...viteSSRPlugin,
  alias: {
    vitedge: 'vitedge/entry-client',
  },
}
