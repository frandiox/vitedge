import {
  createResponse,
  createNotFoundResponse,
  resolveFnsEndpoint,
} from './utils'
import { getCachedResponse, setCachedResponse } from './cache'
import { safeHandler } from '../errors'

const API_PREFIX = '/api'

function normalizeRoute(pathname) {
  // Remove trailing slashes and file extensions
  return pathname.replace(/(\/|\.\w+)$/, '')
}

export function isApiRequest(event) {
  const pathname = normalizeRoute(new URL(event.request.url).pathname)

  return (
    pathname.startsWith(API_PREFIX + '/') ||
    !!resolveFnsEndpoint(pathname, true)
  )
}

export function parseQuerystring(event) {
  const url = new URL(event.request.url)
  // Parse querystring similarly to Express or Rails (there's no standard for this)
  const query = Object.fromEntries(url.searchParams)

  return { url, query }
}

function buildApiResponse(data, options) {
  options = options || {}

  const headers = {
    'content-type': 'application/json;charset=UTF-8',
    ...(options.headers || {}),
  }

  if ((headers['content-type'] || '').startsWith('application/json')) {
    data = JSON.stringify(data)
  }

  return createResponse(data, {
    status: options.status || 200,
    statusText: options.statusText,
    headers,
  })
}

export async function handleApiRequest(event) {
  const cacheKey = event.request.url
  const cachedResponse = await getCachedResponse(cacheKey)
  if (cachedResponse) {
    return cachedResponse
  }

  const url = new URL(event.request.url)
  const resolvedFn = resolveFnsEndpoint(normalizeRoute(url.pathname))

  if (resolvedFn) {
    let {
      params,
      value: { handler, options = {} },
    } = resolvedFn

    const { url, query } = parseQuerystring(event)

    let response = await safeHandler(() =>
      handler({
        event,
        request: event.request,
        headers: event.request.headers,
        url,
        query,
        params,
      })
    )

    if (!response.clone) {
      // Returned value is not a FetchResponse => build one
      const { data, ...dynamicOptions } = response
      options = { ...options, ...dynamicOptions }
      response = buildApiResponse(data, options)
    }

    if ((options.status || 0) < 400) {
      setCachedResponse(event, response, cacheKey, (options.cache || {}).api)
    }

    return response
  }

  return createNotFoundResponse()
}

const originalFetch = globalThis.fetch

export function createLocalFetch(instanceRequest, waitUntil) {
  return function localFetch(resource, options = {}) {
    const cookie = instanceRequest.headers.get('cookie')
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
      const event = {
        type: 'fetch',
        waitUntil,
        request: new Request(
          new URL(instanceRequest.url).origin + resource,
          new Request(instanceRequest, options)
        ),
      }

      if (isApiRequest(event)) {
        return handleApiRequest(event)
      }
    }

    return originalFetch(resource, options)
  }
}
