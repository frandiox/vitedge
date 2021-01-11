import './index.css'
import App from './App.vue'
import routes from './routes'
import vitedge, { Helmet } from 'vitedge'

export default vitedge(
  App,
  { routes },
  ({ app, router, isClient, initialState, initialRoute }) => {
    // Custom setup hook.
    // E.g. set initialState in a Vuex store, install plugins, etc.

    app.component(Helmet.name, Helmet)
  }
)
