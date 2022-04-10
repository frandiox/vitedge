import { IS_SSR_PAGE } from '../utils/dom'
import { findRoutePropsGetter } from '../utils/props'

export function onFunctionReload(getCurrentRoute, updateState) {
  if (import.meta.hot) {
    import.meta.hot.on('function-reload', async (data) => {
      const currentRoute = getCurrentRoute()
      const propsGetter = findRoutePropsGetter(currentRoute)
      if (propsGetter === data.path) {
        console.info('[Vitedge] Reloading', data.path)
        updateState(currentRoute)
      }
    })
  }
}

export function setupPropsEndpointsWatcher() {
  if (import.meta.hot) {
    return new Promise((resolve) => {
      // Listen for new props handlers in backend
      import.meta.hot.on('props-endpoints-change', async (data) => {
        // Save it globally during development. This will be used
        // to know if a page can make a "get page props" request or not.
        window.__AVAILABLE_PROPS_ENDPOINTS__ = data.names
        resolve()
      })

      // The previous listener doesn't get the very first event
      // because it is fired before the frontend is ready.
      // This call will trigger a new 'initial' event.
      fetch('/__dev-setup-props-watcher').catch((error) =>
        console.error(
          '[Vitedge] Failed to setup props watcher: ' + error.message
        )
      )

      // Wait in SPA mode until the event reached the browsers or fallback:
      IS_SSR_PAGE ? resolve() : setTimeout(resolve, 2000)
    })
  }
}
