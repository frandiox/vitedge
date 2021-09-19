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

function hasAttribute(string, attr) {
  return new RegExp(`\\s${attr}[\\s>]`).test(string)
}

function extractAttribute(string, attr) {
  const [_, content] = string.match(new RegExp(`${attr}="(.*?)"`)) || []
  return content
}

export function buildLinkHeader(html, { destinations = [] } = {}) {
  const filesToPush = []

  // Only care about head part
  const [head = ''] = html.split('</head>')

  const matches =
    // Regexp should be OK for parsing this HTML subset
    head.match(/<(script[\s\w="]+src.+?)>|<(link[\s\w="]+href.+?)>/gm) || []

  for (const match of matches) {
    if (match) {
      let resource, destination

      if (destinations.includes('script') && match.startsWith('<script')) {
        if (!hasAttribute(match, 'async') && !hasAttribute(match, 'defer')) {
          destination = 'script'
          resource = extractAttribute(match, 'src')
        }
      } else if (match.startsWith('<link')) {
        const rel = extractAttribute(match, 'rel')
        if (destinations.includes('style') && rel === 'stylesheet') {
          destination = 'style'
          resource = extractAttribute(match, 'href')
        }
      }

      if (resource && destination) {
        filesToPush.push(
          `<${resource.replace(
            /^https?:/i,
            ''
          )}>; rel=preload; as=${destination}`
        )
      }
    }
  }

  return filesToPush.join(',')
}
