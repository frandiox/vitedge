import router from '__vitedge_router__'
import api from '__vitedge_api__'

export function isPropsRequest(event) {
  return event.request.url.includes('/props/')
}

export function resolvePropsRoute(url = '') {
  const route = router.resolve(url)

  if (route && Object.prototype.hasOwnProperty.call(api, route.propsGetter)) {
    return {
      ...api[route.propsGetter],
      route,
    }
  }

  return null
}

function buildPropsResponse(payload, options = {}) {
  const headers = {
    'content-type': 'application/json;charset=UTF-8',
    ...options.headers,
  }

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers,
  })
}

export async function getPageProps(event) {
  const propsRoute = resolvePropsRoute(event.request.url)

  if (!propsRoute) {
    return null
  }

  const { handler, options = {}, route = {} } = propsRoute

  const props = await handler({
    ...route,
    request: event.request,
  })

  return { props, options }
}
export async function handlePropsRequest(event) {
  const page = await getPageProps(event)

  if (page) {
    const { props, options = {} } = page

    return buildPropsResponse(props, options)
  }

  return new Response('Not found', { status: 404 })
}
