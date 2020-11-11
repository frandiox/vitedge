import handler from '__vitedge_handler__'
import api from '__vitedge_api__'

export async function handleViewRendering(event) {
  const { html } = await handler({
    request: event.request,
    api,
  })

  const response = new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  })

  return response
}
