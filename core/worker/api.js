import api from '__vitedge_api__'

const MIN_CACHE_AGE = 60

export function isApiRequest(event) {
  return event.request.url.includes('/api/')
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

function buildApiResponse(data, options = {}) {
  const headers = {
    'content-type': 'application/json;charset=UTF-8',
    ...options.headers,
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers,
  })
}

export function buildAndCacheApiResponse({ event, data, options, cacheKey }) {
  const response = buildApiResponse(data, options)

  const cacheMaxAge =
    (event.request.method === 'GET' && (options.cache || {}).api) || 0

  if (cacheMaxAge > MIN_CACHE_AGE) {
    const url = new URL(event.request.url)
    response.headers.append('cache-control', `public, max-age=${cacheMaxAge}`)

    event.waitUntil(
      caches.default.put(
        new Request(cacheKey || url.pathname + url.search),
        response.clone()
      )
    )
  }

  return response
}

export async function handleApiRequest(event) {
  const propsGetter = Object.prototype.hasOwnProperty.call(
    api,
    apiRoute.propsGetter
  )

  if (Object.prototype.hasOwnProperty.call(api, propsGetter)) {
    const { handler, options } = api[propsGetter]
    const { query } = parseQuerystring(event)

    const data = await handler({
      request: {
        ...event.request,
        query,
      },
      ...query,
    })

    return buildAndCacheApiResponse({ event, data, options })
  }

  return new Response('', { status: 404 })
}
