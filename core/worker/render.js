import router from '__vitedge_router__'
import { getPageProps } from './props'

export async function handleViewRendering(event) {
  const page = await getPageProps(event)

  const { html } = await router.render({
    initialState: (page || {}).props || {},
    request: event.request,
  })

  const response = new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  })

  return response
}
