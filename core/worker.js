import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import handler from '__vitedge_handler__'
import api from '__vitedge_api__'

export async function handleEvent(
  event,
  {
    willRequestAsset,
    didRequestAsset,
    willRequestApi,
    didRequestApi,
    willRequestRender,
    didRequestRender,
  }
) {
  if (
    event.request.url.includes('/_assets/') ||
    event.request.url.includes('/favicon.ico')
  ) {
    // --- STATIC FILES
    willRequestAsset && (await willRequestAsset({ event }))

    const response = await getAssetFromKV(event, {})

    return (
      (didRequestAsset && (await didRequestAsset({ event, response }))) ||
      response
    )
  } else if (event.request.url.includes('/api/')) {
    // --- API ENDPOINTS
    const url = new URL(event.request.url)
    // Parse querystring similarly to Express or Rails (there's no standard for this)
    const query = Array.from(url.searchParams.entries()).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: value,
      }),
      {}
    )

    willRequestApi && (await willRequestApi({ event, url, query }))

    const apiHandler = (api[url.pathname.replace('/api/', '')] || {}).handler

    const response = apiHandler
      ? new Response(
          JSON.stringify(
            await apiHandler({
              request: {
                ...event.request,
                query,
              },
              ...query,
            })
          ),
          {
            status: 200,
            headers: { 'content-type': 'application/json;charset=UTF-8' },
          }
        )
      : new Response('', { status: 404 })

    didRequestApi && didRequestApi({ event, url, query, response })
    return response
  } else {
    // --- SSR
    willRequestRender && (await willRequestRender({ event }))

    const { html } = await handler({ request: event.request, api })

    const response = new Response(html, {
      status: 200,
      headers: {
        'content-type': 'text/html;charset=UTF-8',
      },
    })

    didRequestRender && didRequestRender({ event, html, response })

    return response
  }
}
