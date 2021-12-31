import App from './App'
import routes from './routes'
import vitedge from 'vitedge'

export default vitedge(App, { routes }, ({ url, isClient, ...context }) => {
  /* Custom hook */
})
