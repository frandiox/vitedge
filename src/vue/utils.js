import { createRouter, createMemoryHistory } from 'vue-router'
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

  const router = createRouter({
    routes,
    history: createMemoryHistory(routeBase),
  })

  return buildPropsRoute(router.resolve(fullPath))
}
