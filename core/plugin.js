import viteSSRPlugin from 'vite-ssr/plugin.js'

export default {
  ...viteSSRPlugin,
  alias: {
    vitedge: 'vitedge/entry-client',
  },
}
