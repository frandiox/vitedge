import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import handler from '../example/dist/ssr/src/main'
import api from '../example/dist/api'

addEventListener('fetch', (event) => {
  try {
    event.respondWith(handleEvent(event))
  } catch (e) {
    event.respondWith(
      new Response(e.message || e.toString(), {
        status: 500,
      })
    )
  }
})

async function handleEvent(event) {
  try {
    if (
      event.request.url.includes('/_assets/') ||
      event.request.url.includes('/favicon.ico')
    ) {
      // --- STATIC FILES
      return await getAssetFromKV(event, {})
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

      console.log('api', url.pathname, query)

      const apiHandler = api[url.pathname.replace('/api/', '')]

      if (apiHandler) {
        return new Response(
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
      }

      return new Response('', { status: 404 })
    } else {
      // --- SSR

      const { html } = await handler({ request: event.request, api })

      return new Response(html, {
        status: 200,
        headers: {
          'content-type': 'text/html;charset=UTF-8',
        },
      })
    }
  } catch (error) {
    console.log('Error:', error.message)
    return new Response(error.message, {
      status: 500,
      headers: {
        'content-type': 'text/plain',
      },
    })
  }
}
