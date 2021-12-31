import { matchRoutes } from 'react-router-config'
import {
  createUrl,
  getFullPath,
  withoutPrefix,
  withoutSuffix,
} from 'vite-ssr/utils/route'
import { buildPropsRoute, PROPS_PREFIX } from '../utils/props'

export function resolvePropsRoute(routes, path, base) {
  const url = createUrl(path)
  url.pathname = withoutPrefix(url.pathname, PROPS_PREFIX + '/')

  const routeBase = base && withoutSuffix(base({ url }), '/')
  const fullPath = getFullPath(url, routeBase)

  const [{ route, match = {} } = {}] = matchRoutes(
    routes,
    createUrl(fullPath).pathname
  )

  const data = {
    ...route,
    fullPath,
    query: Object.fromEntries(url.searchParams),
    params: match.params,
  }

  return buildPropsRoute(data)
}
