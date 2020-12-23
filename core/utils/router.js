import { createRouter, createMemoryHistory } from 'vue-router'
import {
  createUrl,
  getFullPath,
  withoutPrefix,
  withoutSuffix,
} from 'vite-ssr/utils'

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

  const { matched: _1, meta: _2, redirectedFrom: _3, ...data } = route

  const url = createUrl(route.href || route.fullPath)
  url.pathname = PROPS_PREFIX + url.pathname

  if (process.env.NODE_ENV === 'development') {
    url.searchParams.set('propsGetter', propsGetter)
    url.searchParams.set('data', encodeURIComponent(JSON.stringify(data)))
  }

  const fullPath = getFullPath(url)

  return {
    ...data,
    propsGetter,
    fullPath,
  }
}

export function resolvePropsRoute(routes, path, base) {
  const url = createUrl(path)
  url.pathname = withoutPrefix(url.pathname, PROPS_PREFIX + '/')

  const routeBase = base && withoutSuffix(base({ url }))
  const fullPath = getFullPath(url, routeBase)

  const router = createRouter({
    routes,
    history: createMemoryHistory(routeBase),
  })

  return buildPropsRoute(router.resolve(fullPath))
}
