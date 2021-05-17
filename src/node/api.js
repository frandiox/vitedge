import nodeFetch from 'node-fetch'
import { safeHandler } from '../errors.js'
import { findRouteValue } from '../utils/api-routes.js'
import { getEventType, normalizePathname } from './utils.js'

export async function handleApiRequest({ url, functions }, event) {
  const pathname = normalizePathname(url)
  const resolvedFn = findRouteValue(pathname, functions)

  if (resolvedFn) {
    const { data, ...options } = await safeHandler(() =>
      resolvedFn.value.handler({
        ...event,
        params: resolvedFn.params,
        url,
      })
    )

    const headers = {
      'content-type': 'application/json; charset=utf-8',
      ...(resolvedFn.value.options || {}).headers,
      ...options.headers,
    }

    return {
      statusCode: options.status || 200,
      statusMessage: options.statusText,
      ...options,
      headers,
      body: (headers['content-type'] || '').startsWith('application/json')
        ? JSON.stringify(data)
        : data,
    }
  } else {
    return { statusCode: 404 }
  }
}

export function createLocalFetch({ url, functions }) {
  // Redirect API requests during SSR to bundled functions
  return async function localFetch(resource, options = {}) {
    if (typeof resource === 'string' && resource.startsWith('/')) {
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

    return nodeFetch(resource, options)
  }
}
