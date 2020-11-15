import router from '__vitedge_router__'
import { getCachedResponse, setCachedResponse } from './cache'
import { getPageProps } from './props'
import { createResponse } from './utils'

export async function handleViewRendering(event) {
  const cacheKey = event.request.url
  const cachedResponse = await getCachedResponse(cacheKey)
  if (cachedResponse) {
    return cachedResponse
  }

  const page = await getPageProps(event)
  const initialState = page ? await page.response.json() : {}

  const { html } = await router.render({
    initialState,
    request: event.request,
  })

  const response = createResponse(html, {
    status: 200,
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  })

  setCachedResponse(event, response, cacheKey, (page.options.cache || {}).html)

  return response
}
