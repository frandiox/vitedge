import router from '__vitedge_router__'
import fns from '__vitedge_functions__'
import { getCachedResponse, setCachedResponse } from './cache'
import { createNotFoundResponse, createResponse } from './utils'

const PROPS_PREFIX = '/props'
export function isPropsRequest(event) {
  return event.request.url.includes(PROPS_PREFIX + '/')
}

function resolvePropsRoute(url = '') {
  const { href, origin } = new URL(url)
  const route = router.resolve(href.replace(origin, ''))

  if (route && Object.prototype.hasOwnProperty.call(fns, route.propsGetter)) {
    return {
      ...fns[route.propsGetter],
      route,
    }
  }

  return null
}

function buildPropsResponse(props, options) {
  const headers = {
    'content-type': 'application/json;charset=UTF-8',
    ...((options && options.headers) || {}),
  }

  return createResponse(JSON.stringify(props), {
    status: 200,
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
  const propsRoute = resolvePropsRoute(event.request.url)

  if (!propsRoute) {
    return null
  }

  const { handler, options: staticOptions, route } = propsRoute
  const cacheOption =
    staticOptions && staticOptions.cache && staticOptions.cache.api
  const cacheKey = cacheOption && getCacheKey(event)

  if (cacheOption) {
    const response = await getCachedResponse(cacheKey)
    if (response) {
      return { options: staticOptions, response }
    }
  }

  const { data, options: dynamicOptions } = await handler({
    ...(route || {}),
    event,
    request: event.request,
    headers: event.request.headers,
  })

  const options = Object.assign({}, staticOptions || {}, dynamicOptions || {})

  const response = buildPropsResponse(data, options)

  if (cacheOption) {
    setCachedResponse(event, response, cacheKey, cacheOption)
  }

  return { options, response }
}

export async function handlePropsRequest(event) {
  const page = await getPageProps(event)

  if (page) {
    return page.response
  }

  return createNotFoundResponse()
}
