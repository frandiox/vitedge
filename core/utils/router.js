const PROPS_PREFIX = 'props/'

export function addPagePropsGetterToRoutes(routes) {
  routes.forEach((route) => {
    route.props = (r) => ({
      ...(r.meta.state || {}),
      ...((r.props === true ? r.params : r.props) || {}),
    })
  })
}

export function findRoutePropsGetter(to, from) {
  if (to.meta.propsGetter === false) {
    return false
  }

  let getter

  if (to.meta.propsGetter) {
    getter =
      to.meta.propsGetter instanceof Function
        ? to.meta.propsGetter(to, from)
        : to.meta.propsGetter
  }

  getter = getter || to.name

  return getter ? PROPS_PREFIX + getter : false
}

export function prepareRouteParams(route, { stringify = false } = {}) {
  const params = {}

  if (route.name) {
    params.name = route.name
  }

  if (route.hash) {
    params.hash = route.hash
  }

  if (Object.keys(route.params || {}).length > 0) {
    params.params = stringify
      ? encodeURIComponent(new URLSearchParams(route.params).toString())
      : route.params
  }

  if (Object.keys(route.query || {}).length > 0) {
    params.query = stringify
      ? encodeURIComponent(new URLSearchParams(route.query).toString())
      : route.query
  }

  return params
}
