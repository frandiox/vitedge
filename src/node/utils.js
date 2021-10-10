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
        // Weird issue with enumerated properties and spread operator:
        // https://github.com/frandiox/vitedge/discussions/61#discussioncomment-1353819
        headers: nodeRequest.headers,
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
          // Weird issue with enumerated properties and spread operator:
          // https://github.com/frandiox/vitedge/discussions/61#discussioncomment-1353819
          headers: nodeRequest.headers,
          ...nodeRequest,
          body: data.length === 0 ? undefined : Buffer.concat(data),
        })
      )
    })
  })
}

async function fetchToNodeResponse(fetchResponse) {
  return {
    data: Buffer.from(await fetchResponse.arrayBuffer()),
    status: fetchResponse.status,
    statusText: fetchResponse.statusText,
    headers: Object.fromEntries(fetchResponse.headers),
    webSocket: fetchResponse.webSocket,
  }
}

export async function parseHandlerResponse(handlerResponse, staticOptions) {
  if (typeof handlerResponse.arrayBuffer === 'function') {
    handlerResponse = await fetchToNodeResponse(handlerResponse)
  }

  const { data, ...options } = handlerResponse

  const headers = {
    'content-type': 'application/json; charset=utf-8',
    ...(staticOptions || {}).headers,
    ...options.headers,
  }

  return {
    statusCode: options.status || 200,
    statusMessage: options.statusText,
    ...options,
    headers,
    body:
      !Buffer.isBuffer(data) &&
      (headers['content-type'] || '').startsWith('application/json')
        ? JSON.stringify(data)
        : data,
  }
}
