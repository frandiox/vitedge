const viteSSRPlugin = require('vite-ssr/plugin')

module.exports = {
  ...viteSSRPlugin,
  alias: {
    vueflare: 'vueflare/entry-client',
  },
}
