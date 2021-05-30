import fns from '__vitedge_functions__'
import { findRouteValue } from '../utils/api-routes.js'
import { cors } from '../utils/cors.js'

export function resolveFnsEndpoint(endpoint, onlyStatic = false) {
  return findRouteValue(endpoint, fns, { onlyStatic })
}

export function createResponse(body, params = {}) {
  const response = new Response(body, params)
  response.headers.append('x-vitedge', 'true')

  return response
}

export function createNotFoundResponse() {
  return createResponse(null, { status: 404 })
}

function handleCors(options, response) {
  const headers = cors(options, response.status === 204)

  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value)
  }

  return response
}

export function addCorsHeaders(maybeResponse, options) {
  if (
    !options &&
    maybeResponse &&
    !maybeResponse.then &&
    !maybeResponse.clone
  ) {
    // Used as `addCorsHeaders()` or `addCorsHeaders({ ... })` for preflight
    options = maybeResponse
    maybeResponse = null
  }

  if (!maybeResponse) {
    maybeResponse = createResponse(null, { status: 204 })
  }

  return maybeResponse.then
    ? maybeResponse.then(handleCors.bind(null, options))
    : handleCors(options, maybeResponse)
}
