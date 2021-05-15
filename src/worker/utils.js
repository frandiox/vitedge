import fns from '__vitedge_functions__'

export function resolveFnsEndpoint(endpoint, onlyStrings = false) {
  if (fns.strings[endpoint]) {
    return { meta: fns.strings[endpoint] }
  }

  if (onlyStrings) {
    return null
  }

  let meta
  let params = {}

  for (const [regexp, value] of fns.regexps) {
    const match = regexp.exec(endpoint)
    if (match) {
      meta = value.value
      for (let i = 0; i < value.keys.length; i++) {
        params[value.keys[i]] = match[i + 1]
      }

      break
    }
  }

  if (meta) {
    return { meta, params }
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
