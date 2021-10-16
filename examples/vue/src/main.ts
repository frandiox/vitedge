import './index.css'
import App from './App.vue'
import routes from './routes'
import vitedge from 'vitedge'

// Workaround for Vite 2.6.x
// https://github.com/vitejs/vite/issues/5270
if (import.meta.hot) {
  globalThis.__hot = import.meta.hot
}

export default vitedge(
  App,
  { routes },
  ({ app, router, isClient, initialState, initialRoute }) => {
    // Custom setup hook.
    // E.g. set initialState in a Vuex store, install plugins, etc.

    router.beforeEach((to) => {
      console.log('Before fetching props', to.meta.state)
    })
    router.beforeResolve((to) => {
      console.log('After fetching props', to.meta.state)
    })
  }
)
