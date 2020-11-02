const vueflarePlugin = require('vueflare/plugin')

module.exports = {
  plugins: [vueflarePlugin],
  proxy: {
    '/api': {
      // This is the server in `node-site` directory
      target: 'http://localhost:8080',
    },
  },
}
