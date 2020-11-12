import api from '__vitedge_api__'

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

function buildApiResponse(payload, options = {}) {
  const headers = {
    'content-type': 'application/json;charset=UTF-8',
    ...options.headers,
  }

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers,
  })
}

export async function handleApiRequest(event) {
  const url = new URL(event.request.url)
  const endpoint = url.pathname.replace(API_PREFIX, '')

  if (Object.prototype.hasOwnProperty.call(api, endpoint)) {
    const { handler, options = {} } = api[endpoint]

    const { url, query } = parseQuerystring(event)
    const payload = await handler({ event, request: event.request, url, query })

    return buildApiResponse(payload, options)
  }

  return new Response('Not found', { status: 404 })
}
