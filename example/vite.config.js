const vitedgePlugin = require('vitedge/plugin')

module.exports = {
  plugins: [vitedgePlugin],
  proxy: {
    '/api': {
      // This is the server in `node-site` directory
      target: 'http://localhost:8080',
    },
  },
}
