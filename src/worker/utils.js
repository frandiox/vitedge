import fns from '__vitedge_functions__'

export function resolveFnsEndpoint(endpoint) {
  if (fns.strings[endpoint]) {
    return { meta: fns[endpoint] }
  }

  return null
}

export function createResponse(body, params = {}) {
  const response = new Response(body, params)
  response.headers.append('x-vitedge', 'true')

  return response
}

export function createNotFoundResponse() {
  return createResponse(null, { status: 404 })
}
