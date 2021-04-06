import { findRoutePropsGetter } from '../utils/props'

export function onFunctionReload(getCurrentRoute, updateState) {
  import.meta.hot.on('function-reload', async (data) => {
    const currentRoute = getCurrentRoute()
    const propsGetter = findRoutePropsGetter(currentRoute)
    if (propsGetter === data.path) {
      console.info('Reloading', data.path)
      updateState(currentRoute)
    }
  })
}
