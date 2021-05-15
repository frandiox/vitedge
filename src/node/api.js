import nodeFetch from 'node-fetch'
import { safeHandler } from '../errors.js'
import { getEventType, normalizePathname } from './utils.js'

export async function handleApiRequest({ url, functions }, event) {
  const params = {}
  const pathname = normalizePathname(url)

  let fnMeta = functions.strings[pathname]

  if (!fnMeta) {
    for (const [regexp, value] of functions.regexps) {
      const match = regexp.exec(pathname)
      if (match) {
        fnMeta = value.value
        for (let i = 0; i < value.keys.length; i++) {
          params[value.keys[i]] = match[i + 1]
        }

        break
      }
    }
  }

  if (fnMeta) {
    const { data, ...options } = await safeHandler(() =>
      fnMeta.handler({
        ...event,
        params,
        url,
      })
    )

    const headers = {
      'content-type': 'application/json; charset=utf-8',
      ...(fnMeta.options || {}).headers,
      ...options.headers,
    }

    return {
      statusCode: options.status || 200,
      statusMessage: options.statusText,
      ...options,
      headers,
      body: (headers['content-type'] || '').startsWith('application/json')
        ? JSON.stringify(data)
        : data,
    }
  } else {
    return { statusCode: 404 }
  }
}

export function createLocalFetch({ url, functions }) {
  // Redirect API requests during SSR to bundled functions
  return async function localFetch(resource, options = {}) {
    if (typeof resource === 'string' && resource.startsWith('/')) {
      url = new URL(url)
      ;[url.pathname, url.search] = resource.split('?')

      if (getEventType({ functions, url }) === 'api') {
        const request = new Request(url, options)

        const {
          body,
          headers,
          statusCode: status,
        } = await handleApiRequest(
          { url, functions },
          { url, request, event: { request } }
        )

        return new Response(body, { headers, status })
      }
    }

    return nodeFetch(resource, options)
  }
}
