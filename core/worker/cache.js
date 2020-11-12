const MIN_CACHE_AGE = 60
const CACHE_METHODS = ['GET']
const X_HEADER_CACHE = 'x-vitedge-cached'

export async function getCachedResponse(cacheKey) {
  let response = await caches.default.match(cacheKey)

  if (response) {
    response = new Response(response.body, response)
    response.headers.append(X_HEADER_CACHE, 'true')
  }

  return response
}

export async function setCachedResponse(
  event,
  response,
  cacheKey,
  cacheOption
) {
  if (!response.headers.has(X_HEADER_CACHE)) {
    const cacheMaxAge = cacheOption === true ? 2628000 : cacheOption || 0

    if (
      CACHE_METHODS.includes(event.request.method) &&
      cacheMaxAge > MIN_CACHE_AGE
    ) {
      response.headers.append('cache-control', `public, max-age=${cacheMaxAge}`)
      // TODO Support stale-while-revalidate
      event.waitUntil(caches.default.put(cacheKey, response.clone()))
    }
  }
}
