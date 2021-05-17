import fns from '__vitedge_functions__'
import { findRouteValue } from '../utils/api-routes'

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
