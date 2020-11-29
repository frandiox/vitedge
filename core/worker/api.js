import fns from '__vitedge_functions__'
import { getCachedResponse, setCachedResponse } from './cache'
import { createResponse, createNotFoundResponse } from './utils'

const API_PREFIX = '/api'

export function isApiRequest(event) {
  return event.request.url.includes(API_PREFIX + '/')
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

function buildApiResponse(data, option) {
  const headers = {
    'content-type': 'application/json;charset=UTF-8',
    ...((options && options.headers) || {}),
  }

  return createResponse(JSON.stringify(data), {
    status: 200,
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
  const endpoint = url.pathname

  if (Object.prototype.hasOwnProperty.call(fns, endpoint)) {
    const { handler, options } = fns[endpoint]

    const { url, query } = parseQuerystring(event)
    const { data } = await handler({
      request: event.request,
      event,
      url,
      query,
    })

    const response = buildApiResponse(data, options)

    setCachedResponse(
      event,
      response,
      cacheKey,
      ((options && options.cache) || {}).api
    )

    return response
  }

  return createNotFoundResponse()
}
