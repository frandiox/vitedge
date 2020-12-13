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

const EXAMPLE_URL = 'http://e.g'
function getUrlFromPath(path) {
  return new URL(EXAMPLE_URL + path)
}

export function buildPropsRoute(route) {
  const propsGetter = findRoutePropsGetter(route)

  if (!propsGetter) {
    return null
  }

  const { matched: _1, meta: _2, redirectedFrom: _3, ...data } = route

  const url = getUrlFromPath(route.fullPath)
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

export function resolvePropsRoute(routes, path, base) {
  const routeBase = base && base({ url: getUrlFromPath(path) })
  let initialRoutePath = path.replace(PROPS_PREFIX + '/', '/')
  if (routeBase && initialRoutePath.startsWith(routeBase)) {
    initialRoutePath = initialRoutePath.replace(routeBase, '/')
  }

  const router = createRouter({
    routes,
    history: createMemoryHistory(routeBase),
  })

  return buildPropsRoute(router.resolve(initialRoutePath))
}
