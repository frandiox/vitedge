export function normalizePathname(url) {
  return url.pathname.replace(/(\/|\.\w+)$/, '')
}

export function getEventType({ url, functions }) {
  const path = normalizePathname(url)

  if (url.pathname.startsWith('/props/')) {
    return 'props'
  }

  if (path.startsWith('/api/') || !!functions.staticMap.has(path)) {
    return 'api'
  }

  return 'render'
}

export function getUrlFromNodeRequest(req) {
  const secure =
    req.connection.encrypted || req.headers['x-forwarded-proto'] === 'https'

  return new URL(`${secure ? 'https' : 'http'}://${req.headers.host + req.url}`)
}

// Simulate a FetchEvent.request https://developer.mozilla.org/en-US/docs/Web/API/Request
export function nodeToFetchRequest(nodeRequest) {
  if (nodeRequest.body) {
    // Already consumed by another middleware
    const { body } = nodeRequest
    const contentType = nodeRequest.headers['content-type'] || ''
    return Promise.resolve(
      new Request(getUrlFromNodeRequest(nodeRequest), {
        ...nodeRequest,
        body:
          typeof body !== 'string' && contentType.includes('application/json')
            ? JSON.stringify(body)
            : body,
      })
    )
  }

  return new Promise((resolve, reject) => {
    let data = []
    nodeRequest.on('data', (chunk) => data.push(chunk))
    nodeRequest.on('error', (error) => reject(error))
    nodeRequest.on('end', () => {
      resolve(
        new Request(getUrlFromNodeRequest(nodeRequest), {
          ...nodeRequest,
          body: data.length === 0 ? undefined : Buffer.concat(data),
        })
      )
    })
  })
}
