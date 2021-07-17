import router from '__vitedge_router__'
import { isRedirect } from '../utils/response'
import { getSsrManifest } from './assets'
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

  // Only care about head part
  const [head = ''] = html.split('</head>')

  const matches =
    // Regexp should be OK for parsing this HTML subset
    head.match(/<(script[\s\w="]+src.+?)>|<(link[\s\w="]+href.+?)>/gm) || []

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

  const [pageProps, manifest] = await Promise.all([
    getPageProps(event),
    getSsrManifest(event),
  ])

  if (isRedirect(pageProps.response)) {
    // Redirect
    return pageProps.response
  }

  const options = pageProps.options || {}
  const initialState =
    (pageProps.response.body && (await pageProps.response.json())) || {}

  const {
    html,
    status = 200,
    statusText,
    headers: renderingHeaders,
  } = await router.render(event.request.url, {
    initialState,
    propsStatusCode: pageProps.response.status,
    request: event.request,
    manifest,
    preload: true,
  })

  const headers = { ...options.headers, ...renderingHeaders }

  if (html) {
    headers['content-type'] = 'text/html;charset=UTF-8'

    if (http2ServerPush) {
      headers.link = buildLinkHeader(html, http2ServerPush)
    }
  }

  const response = createResponse(html, {
    status,
    statusText,
    headers,
  })

  setCachedResponse(event, response, cacheKey, (options.cache || {}).html)

  return response
}
