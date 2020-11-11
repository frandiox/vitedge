import handler from '__vitedge_handler__'
import api from '__vitedge_api__'
import { buildAndCacheApiResponse } from './api'

export async function handleViewRendering(event) {
  const { html, options = {}, apiRoute } = await handler({
    request: event.request,
    api,
  })

  const url = new URL(event.request.url)

  buildAndCacheApiResponse({
    event,
    options,
    data: apiRoute.data,
    cacheKey: url.origin + apiRoute.fullPath,
  })

  const response = new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  })

  return response
}
