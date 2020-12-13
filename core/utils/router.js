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

export function buildPropsRoute(route) {
  const propsGetter = findRoutePropsGetter(route)

  if (!propsGetter) {
    return null
  }

  const data = {
    name: route.name,
    hash: route.hash,
    params: route.params,
    query: route.query,
  }

  const EXAMPLE_URL = 'http://e.g'
  const url = new URL(EXAMPLE_URL + route.fullPath)
  url.pathname = PROPS_PREFIX + url.pathname

  if (process.env.NODE_ENV === 'development') {
    url.searchParams.append('propsGetter', propsGetter)
    url.searchParams.append('data', encodeURIComponent(JSON.stringify(data)))
  }

  const fullPath = url.toString().replace(EXAMPLE_URL, '')

  return {
    ...data,
    propsGetter,
    fullPath,
  }
}

export function resolvePropsRoute(routes, url) {
  const router = createRouter({ routes, history: createMemoryHistory() })
  return buildPropsRoute(router.resolve(url.replace(PROPS_PREFIX + '/', '/')))
}
