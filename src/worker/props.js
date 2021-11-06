import router from '__vitedge_router__'
import { safeHandler } from '../errors'
import { getCachedResponse, setCachedResponse } from './cache'
import {
  createNotFoundResponse,
  createResponse,
  resolveFnsEndpoint,
} from './utils'

const PROPS_PREFIX = '/props'
export function isPropsRequest(event) {
  return event.request.url.includes(PROPS_PREFIX + '/')
}

function resolvePropsRoute(url = '') {
  const route = router.resolve(new URL(url))

  const resolvedFn = route && resolveFnsEndpoint(route.propsGetter, true)

  if (resolvedFn) {
    return {
      ...resolvedFn.value,
      route,
    }
  }

  return null
}

function buildPropsResponse(props, options) {
  options = options || {}
  const headers = {
    'content-type': 'application/json;charset=UTF-8',
    ...(options.headers || {}),
  }

  return createResponse(JSON.stringify(props), {
    status: options.status || 200,
    statusText: options.statusText,
    headers,
  })
}

function getCacheKey(event) {
  // This request might come from rendering so
  // the URL must be modified to match props cache key
  const url = new URL(event.request.url)
  if (!url.pathname.startsWith(PROPS_PREFIX)) {
    url.pathname = PROPS_PREFIX + url.pathname
  }

  return url.toString()
}

export async function getPageProps(event) {
  const {
    handler,
    options: staticOptions,
    route,
  } = resolvePropsRoute(event.request.url) || {}

  if (!handler) {
    return {
      response: undefined,
      options: staticOptions || {},
    }
  }

  const cacheOption =
    staticOptions && staticOptions.cache && staticOptions.cache.api
  const cacheKey = cacheOption && getCacheKey(event)

  if (cacheOption) {
    const response = await getCachedResponse(cacheKey)
    if (response) {
      return { options: staticOptions, response }
    }
  }

  const { data, ...dynamicOptions } = await safeHandler(() =>
    handler({
      ...(route || {}),
      event,
      request: event.request,
      headers: event.request.headers,
    })
  )

  const options = Object.assign({}, staticOptions || {}, dynamicOptions)

  const response = buildPropsResponse(data, options)

  if ((options.status || 0) < 400 && cacheOption) {
    setCachedResponse(event, response, cacheKey, cacheOption)
  }

  return { options, response }
}

export async function handlePropsRequest(event) {
  const { response = createNotFoundResponse() } = await getPageProps(event)

  if (response.status >= 300 && response.status < 400) {
    // Mock redirect status on props request to bypass Fetch opaque responses
    return new Response(response.body, { ...response, status: 299 })
  }

  return response
}
