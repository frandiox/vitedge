import { createUrl, getFullPath } from 'vite-ssr/utils/route'

export const PROPS_PREFIX = '/props'

export function findRoutePropsGetter(route) {
  const { meta = {} } = route
  if (meta.propsGetter === false) {
    return false
  }

  let getter

  if (meta.propsGetter) {
    getter =
      meta.propsGetter instanceof Function
        ? meta.propsGetter(route)
        : meta.propsGetter
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

  if (import.meta.env.DEV) {
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
