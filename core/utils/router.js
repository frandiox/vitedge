import { createRouter, createMemoryHistory } from 'vue-router'

const PROPS_PREFIX = '/props'

export function addPagePropsGetterToRoutes(routes) {
  routes.forEach((route) => {
    route.props = (r) => ({
      ...(r.meta.state || {}),
      ...((r.props === true ? r.params : r.props) || {}),
    })
  })
}

function findRoutePropsGetter(route) {
  if (route.meta.propsGetter === false) {
    return false
  }

  let getter

  if (route.meta.propsGetter) {
    getter =
      route.meta.propsGetter instanceof Function
        ? route.meta.propsGetter(route)
        : route.meta.propsGetter
  }

  getter = getter || route.name

  return getter ? PROPS_PREFIX + '/' + getter : false
}

function prepareRouteData(route) {
  const data = {}

  if (route.name) {
    data.name = route.name
  }

  if (route.hash) {
    data.hash = route.hash
  }

  if (Object.keys(route.params || {}).length > 0) {
    data.params = route.params
  }

  if (Object.keys(route.query || {}).length > 0) {
    data.query = route.query
  }

  return data
}

export function buildPropsRoute(route) {
  const propsGetter = findRoutePropsGetter(route)

  if (!propsGetter) {
    return null
  }

  const data = prepareRouteData(route)

  return {
    ...data,
    propsGetter,
    fullPath: route.fullPath.replace(route.path, PROPS_PREFIX + route.path),
  }
}

export function resolvePropsRoute(routes, url) {
  const router = createRouter({ routes, history: createMemoryHistory() })
  return buildPropsRoute(router.resolve(url.replace(PROPS_PREFIX + '/', '/')))
}
