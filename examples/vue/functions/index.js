import { handleEvent } from 'vitedge/worker'

export default {
  async fetch(request, env) {
    try {
      return await handleEvent(
        // TODO where's waitUntil?
        { request, env, waitUntil: () => {} },
        {
          http2ServerPush: {
            destinations: ['style'],
          },
          willRequestApi({ url, query }) {
            console.log('API:', url.pathname, query)
          },
        }
      )
    } catch (error) {
      return new Response(error.message || error.toString(), {
        status: 500,
      })
    }
  },
}
