import router from '__vitedge_router__'
import { getCachedResponse, setCachedResponse } from './cache'
import { getPageProps } from './props'
import { createResponse } from './utils'

function hasAttribute(string, attr) {
  return new RegExp(`\\s${attr}[\\s>]`).test(string)
}

function extractAttribute(string, attr) {
  const [_, content] = string.match(new RegExp(`${attr}="(.*?)"`)) || []
  return content
}

function buildLinkHeader(html, { destinations = [] } = {}) {
  let filesToPush = []

  const matches =
    html.match(/<(script[\s\w="]+src.+?)>|<(link[\s\w="]+href.+?)>/gm) || []

  for (const match of matches) {
    if (match) {
      let resource, destination

      if (destinations.includes('script') && match.startsWith('<script')) {
        if (!hasAttribute(match, 'async') && !hasAttribute(match, 'defer')) {
          destination = 'script'
          resource = extractAttribute(match, 'src')
        }
      } else if (match.startsWith('<link')) {
        const rel = extractAttribute(match, 'rel')
        if (destinations.includes('style') && rel === 'stylesheet') {
          destination = 'style'
          resource = extractAttribute(match, 'href')
        }
      }

      if (resource && destination) {
        filesToPush.push(
          `<${resource.replace(
            /^https?:/i,
            ''
          )}>; rel=preload; as=${destination}`
        )
      }
    }
  }

  return filesToPush.join(',')
}

export async function handleViewRendering(event, { http2ServerPush }) {
  const cacheKey = event.request.url
  const cachedResponse = await getCachedResponse(cacheKey)
  if (cachedResponse) {
    return cachedResponse
  }

  const page = await getPageProps(event)
  const initialState = page ? await page.response.json() : {}

  const { html } = await router.render({
    initialState,
    request: event.request,
  })

  const headers = {
    'content-type': 'text/html;charset=UTF-8',
  }

  if (http2ServerPush) {
    headers.link = buildLinkHeader(html, http2ServerPush)
  }

  const response = createResponse(html, {
    status: 200,
    headers,
  })

  setCachedResponse(event, response, cacheKey, (page.options.cache || {}).html)

  return response
}
