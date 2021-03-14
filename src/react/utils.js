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

  const [{ route } = {}] = matchRoutes(routes, url.pathname)

  return buildPropsRoute({ ...route, fullPath })
}
