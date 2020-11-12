import router from '__vitedge_router__'
import { getPageProps } from './props'
import { createResponse } from './utils'

export async function handleViewRendering(event) {
  const page = await getPageProps(event, { raw: true })

  const { html } = await router.render({
    initialState: (page || {}).props || {},
    request: event.request,
  })

  const response = createResponse(html, {
    status: 200,
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  })

  return response
}
