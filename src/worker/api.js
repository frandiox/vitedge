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
  const query = Array.from(url.searchParams.entries()).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: value,
    }),
    {}
  )

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
    const {
      params,
      meta: { handler, options: staticOptions },
    } = resolvedFn

    const { url, query } = parseQuerystring(event)
    const { data, ...dynamicOptions } = await safeHandler(() =>
      handler({
        event,
        request: event.request,
        headers: event.request.headers,
        url,
        query,
        params,
      })
    )

    const options = Object.assign({}, staticOptions || {}, dynamicOptions)

    const response = buildApiResponse(data, options)

    if ((options.status || 0) < 400) {
      setCachedResponse(
        event,
        response,
        cacheKey,
        ((options && options.cache) || {}).api
      )
    }

    return response
  }

  return createNotFoundResponse()
}

const originalFetch = globalThis.fetch

export function createLocalFetch(instanceRequest) {
  return function localFetch(resource, options = {}) {
    if (typeof resource === 'string' && resource.startsWith('/')) {
      const event = {
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
