import { safeHandler } from '../errors.js'
import { findRouteValue } from '../utils/api-routes.js'
import {
  getEventType,
  normalizePathname,
  parseHandlerResponse,
} from './utils.js'

export async function handleApiRequest({ url, functions }, event) {
  const pathname = normalizePathname(url)
  const resolvedFn = findRouteValue(pathname, functions)

  if (resolvedFn) {
    const handlerResponse = await safeHandler(() =>
      resolvedFn.value.handler({
        ...event,
        params: resolvedFn.params,
        url,
      })
    )

    return parseHandlerResponse(handlerResponse, resolvedFn.value.options)
  } else {
    return { statusCode: 404 }
  }
}

const originalFetch = globalThis.fetch

export function createLocalFetch({ url, functions, headers: ssrHeaders }) {
  // Redirect API requests during SSR to bundled functions
  return async function localFetch(resource, options = {}) {
    const cookie = ssrHeaders.get('cookie')
    const { credentials } = options || {}
    const isSameOrigin =
      typeof resource === 'string' && resource.startsWith('/')

    if (
      cookie &&
      credentials !== 'omit' &&
      (isSameOrigin || credentials === 'include')
    ) {
      // Relay HTTP cookies for manual fetch subrequests
      // (SSR requests do this automatically)
      options.headers = {
        ...options.headers,
        cookie,
      }
    }

    if (isSameOrigin) {
      url = new URL(url)
      ;[url.pathname, url.search] = resource.split('?')

      if (getEventType({ functions, url }) === 'api') {
        const request = new Request(url, options)

        const {
          body,
          headers,
          statusCode: status,
        } = await handleApiRequest(
          { url, functions },
          { url, request, event: { request } }
        )

        return new Response(body, { headers, status })
      }
    }

    return originalFetch(resource, options)
  }
}
