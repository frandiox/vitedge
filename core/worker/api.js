import api from '__vitedge_api__'

function buildApiResponse(data) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'content-type': 'application/json;charset=UTF-8' },
  })
}

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

export async function handleApiRequest(event) {
  const propsGetter = Object.prototype.hasOwnProperty.call(
    api,
    apiRoute.propsGetter
  )

  if (Object.prototype.hasOwnProperty.call(api, propsGetter)) {
    const { handler: apiHandler } = api[propsGetter]

    const data = await apiHandler({
      request: {
        ...event.request,
        query,
      },
      ...query,
    })

    return buildApiResponse(data)
  }

  return new Response('', { status: 404 })
}
