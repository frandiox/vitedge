import './polyfill.js'
import { createLocalFetch, handleApiRequest } from './api.js'
import { getPageProps } from './props.js'
import { getEventType, nodeToFetchRequest } from './utils.js'
import { isRedirect } from '../utils/response.js'

export { getEventType }
export { cors } from '../utils/cors.js'

export async function handleEvent(
  { functions, router, url, manifest, preload = true, skipSSR },
  event = {}
) {
  const type = getEventType({ url, functions })

  if (event.request && !event.request.clone) {
    // Convert to Fetch Request for consistency
    event.rawRequest = event.rawRequest || event.request
    event.request = await nodeToFetchRequest(event.request)
  }

  globalThis.fetch = createLocalFetch({
    url,
    functions,
    headers: event.request.headers,
  })

  if (type === 'api') {
    return handleApiRequest({ url, functions }, event)
  }

  // From here, only GET method is supported
  const method = event.method || event.httpMethod || 'GET'
  if (method !== 'GET' || url.pathname.includes('favicon.ico')) {
    return { statusCode: 404 }
  }

  const { data: pageProps, options: propsOptions = {} } = await getPageProps(
    { functions, router, url },
    event
  )

  const isRedirecting = isRedirect(propsOptions)
  // This handles SPA page props requests from the browser
  if (type === 'props' || isRedirecting) {
    // Mock status when this is a props request to bypass Fetch opaque responses
    const status =
      type === 'props' && isRedirecting ? 299 : propsOptions.status || 404

    return {
      statusCode: status,
      statusMessage: propsOptions.statusText,
      ...propsOptions,
      status,
      body: JSON.stringify(pageProps || {}),
    }
  }

  // If it didn't match anything else up to here, fallback to HTML rendering
  const {
    html: body,
    status: statusCode = propsOptions.status || 200,
    statusText: statusMessage = propsOptions.statusText,
    headers: renderingHeaders,
    ...extra
  } = await router.render(url, {
    ...event,
    initialState: { ...event.initialState, ...pageProps },
    propsStatusCode: propsOptions.status,
    skip: skipSSR,
    manifest,
    preload,
  })

  const headers = { ...propsOptions.headers, ...renderingHeaders }

  return { body, statusCode, statusMessage, headers, extra }
}
