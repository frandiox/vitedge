import App from './App'
import routes from './routes'
import vitedge from 'vitedge'

// Workaround for Vite 2.6.x
// https://github.com/vitejs/vite/issues/5270
if (import.meta.hot) {
  globalThis.__hot = import.meta.hot
}

export default vitedge(App, { routes }, ({ url, isClient, ...context }) => {
  /* Custom hook */
})
