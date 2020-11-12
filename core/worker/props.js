import router from '__vitedge_router__'
import api from '__vitedge_api__'
import { getCachedResponse, setCachedResponse } from './cache'
import { createNotFoundResponse, createResponse } from './utils'

export function isPropsRequest(event) {
  return event.request.url.includes('/props/')
}

export function resolvePropsRoute(url = '') {
  const route = router.resolve(url)

  if (route && Object.prototype.hasOwnProperty.call(api, route.propsGetter)) {
    return {
      ...api[route.propsGetter],
      route,
    }
  }

  return null
}

function buildPropsResponse(props, options = {}) {
  const headers = {
    'content-type': 'application/json;charset=UTF-8',
    ...options.headers,
  }

  return createResponse(JSON.stringify(props), {
    status: 200,
    headers,
  })
}

export async function getPageProps(event, { raw } = {}) {
  const propsRoute = resolvePropsRoute(event.request.url)

  if (!propsRoute) {
    return null
  }

  const { handler, options = {}, route = {} } = propsRoute

  if (options.cache && options.cache.api) {
    const response = await getCachedResponse(event)

    if (response) {
      if (raw) {
        return {
          options,
          props: await response.json(),
        }
      }

      return { options, response }
    }
  }

  const props = await handler({
    ...route,
    event,
    request: event.request,
  })

  if (raw) {
    return { props, options }
  }

  return {
    options,
    response: buildPropsResponse(props, options),
  }
}

export async function handlePropsRequest(event) {
  const page = await getPageProps(event)

  if (page) {
    const { response, options = {} } = page

    setCachedResponse(event, response, options)

    return response
  }

  return createNotFoundResponse()
}
