const METHODS = ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE']
// iOS 12 is broken and doesn't accept only a wildcard, so specify here all the allowed headers:
const HEADERS = [
  '*',
  'Accept',
  'Content-Type',
  'Content-Length',
  'Accept-Encoding',
  'Referer',
  'Origin',
  'User-Agent',
  'authorization',
]

export function cors(
  { origin, methods, headers, expose, maxage, credentials = true },
  isPreflight
) {
  const actualHeaders = {
    'Access-Control-Allow-Origin': origin || '*',
  }

  if (credentials) {
    actualHeaders['Access-Control-Allow-Credentials'] = 'true'
  }

  if (expose) {
    actualHeaders['Access-Control-Expose-Headers'] = expose
  }

  if (isPreflight) {
    actualHeaders['Access-Control-Allow-Methods'] = methods || METHODS
    actualHeaders['Access-Control-Allow-Headers'] = headers || HEADERS
    actualHeaders['Access-Control-Max-Age'] = maxage || '600'
  }

  return actualHeaders
}
