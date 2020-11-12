const MIN_CACHE_AGE = 60
const CACHE_METHODS = ['GET']
const X_HEADER_CACHE = 'x-vitedge-cached'

export async function getCachedResponse(event) {
  let response = await caches.default.match(event.request.url)

  if (response) {
    response = new Response(response.body, response)
    response.headers.append(X_HEADER_CACHE, 'true')
  }

  return response
}

export async function setCachedResponse(event, response, options) {
  if (!response.headers.has(X_HEADER_CACHE)) {
    const cacheMaxAge =
      (CACHE_METHODS.includes(event.request.method) &&
        (options.cache || {}).api) ||
      0

    if (cacheMaxAge > MIN_CACHE_AGE) {
      response.headers.append('cache-control', `public, max-age=${cacheMaxAge}`)
      // TODO Support stale-while-revalidate
      event.waitUntil(caches.default.put(event.request.url, response.clone()))
    }
  }
}
