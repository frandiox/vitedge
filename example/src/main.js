import './index.css'
import App from './App.vue'
import routes from './routes'
import vitedge from 'vitedge'

export default vitedge(App, { routes }, ({ app, router, isClient }) => {
  // Custom setup hook
})
