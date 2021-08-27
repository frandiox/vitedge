import regexparam from 'regexparam'
import rsort from 'route-sort'

export function findRouteValue(
  pathname,
  { staticMap, dynamicMap },
  { onlyStatic = false } = {}
) {
  let value = staticMap && staticMap.get(pathname)
  let params

  if (!value && !onlyStatic) {
    for (const [regexp, content] of dynamicMap) {
      const match = regexp.exec(pathname)
      if (match) {
        params = {}
        value = content.value
        for (let i = 0; i < (content.keys || []).length || 0; i++) {
          params[content.keys[i]] = match[i + 1]
        }

        break
      }
    }
  }

  return value ? { value, params } : null
}

export function pathsToRoutes(paths, { fnsInputPath }) {
  const staticRoutes = []
  const dynamicRoutes = []

  for (let i = 0; i < paths.length; i++) {
    let route = paths[i].replace(fnsInputPath, '').replace(/\.[tj]sx?$/i, '')

    // Props are always static
    if (!route.startsWith('/props/') && /\[/.test(route)) {
      const original = route
      let wild

      route = new String(
        route
          .replace(/\[\.\.\.([\w-]+)\]/, (_, s1) => {
            wild = s1
            return '*'
          })
          .replace(/\[\[([\w-]+)\]\]/g, ':$1?')
          .replace(/\[([\w-]+)\]/g, ':$1')
      )

      route.index = i
      route.wild = wild
      route.original = original
      dynamicRoutes.push(route)
    } else {
      route = new String(route)
      route.index = i
      staticRoutes.push(route)
    }
  }

  rsort(dynamicRoutes)

  return { staticRoutes, dynamicRoutes }
}

export function routeToRegexp(route) {
  const { keys, pattern } = regexparam(route)

  if (route.wild) {
    const i = keys.indexOf('wild')
    keys[i] = route.wild
  }

  return { keys, pattern }
}
