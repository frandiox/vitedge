import { handleStaticAsset, isStaticAsset } from './assets'
import { isApiRequest, parseQuerystring } from './api'
import { handleViewRendering } from './render'

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
  if (isStaticAsset(event)) {
    // --- STATIC FILES
    willRequestAsset && (await willRequestAsset({ event }))
    const response = await handleStaticAsset(event)

    return (
      (didRequestAsset && (await didRequestAsset({ event, response }))) ||
      response
    )
  } else if (isApiRequest(event)) {
    // --- API ENDPOINTS
    const { url, query } = parseQuerystring(event)

    willRequestApi && (await willRequestApi({ event, url, query }))
    const response = await handleApiRequest(event)

    return (
      (didRequestApi &&
        (await didRequestApi({ event, url, query, response }))) ||
      response
    )
  } else {
    // --- SSR
    willRequestRender && (await willRequestRender({ event }))
    const response = await handleViewRendering(event)

    return (
      (didRequestRender &&
        (await didRequestRender({ event, html, response }))) ||
      response
    )
  }
}
