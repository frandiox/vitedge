const PROPS_PREFIX = 'props/'

export function addPagePropsGetterToRoutes(routes) {
  routes.forEach((route) => {
    route.props = (r) => ({
      ...(r.meta.state || {}),
      ...((r.props === true ? r.params : r.props) || {}),
    })
  })
}

function findRoutePropsGetter(to, from) {
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

export function buildApiRoute(to, from) {
  const propsGetter = findRoutePropsGetter(to, from)

  if (!propsGetter) {
    return null
  }

  const apiPrefix = '/api'

  const data = prepareRouteData(to)

  const querystring = new URLSearchParams({
    ...data,
    params: encodeURIComponent(new URLSearchParams(data.params).toString()),
    query: encodeURIComponent(new URLSearchParams(data.query).toString()),
  }).toString()

  return {
    data,
    apiPrefix,
    propsGetter,
    querystring,
    fullpath:
      apiPrefix + '/' + propsGetter + (querystring ? `?${querystring}` : ''),
  }
}
