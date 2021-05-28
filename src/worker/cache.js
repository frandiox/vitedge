import meta from '__vitedge_meta__'

const MIN_CACHE_AGE = 60
const CACHE_METHODS = ['GET']
const X_HEADER_CACHE = 'x-vitedge-cached'
const X_HEADER_BUILD = 'x-vitedge-build'

export async function getCachedResponse(cacheKey) {
  let response = await caches.default.match(cacheKey)

  if (response) {
    if (
      response.headers.get(X_HEADER_BUILD) !==
      ((meta.vitedge || {}).commitHash || null)
    ) {
      return null
    }

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
    const hasCacheControl = response.headers.has('cache-control')

    if (
      CACHE_METHODS.includes(event.request.method) &&
      (hasCacheControl || cacheMaxAge > MIN_CACHE_AGE)
    ) {
      if ((meta.vitedge || {}).commitHash) {
        response.headers.append(X_HEADER_BUILD, meta.vitedge.commitHash)
      }

      if (!hasCacheControl) {
        response.headers.append(
          'cache-control',
          `public, max-age=${cacheMaxAge}`
        )
      }

      // TODO Support stale-while-revalidate
      event.waitUntil(caches.default.put(cacheKey, response.clone()))
    }
  }
}
