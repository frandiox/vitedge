import { safeHandler } from '../errors.js'
import { nodeToFetchRequest, parseHandlerResponse } from '../node/utils.js'

export function normalizePathname(url) {
  return url.pathname.includes('.')
    ? url.pathname.slice(0, url.pathname.lastIndexOf('.'))
    : url.pathname
}

export async function handleFunctionRequest(
  req,
  res,
  { fnsInputPath, functionPath, extra, mockRedirect }
) {
  try {
    let endpointMeta = await import(`${fnsInputPath}${functionPath}.js`)

    if (endpointMeta) {
      endpointMeta = endpointMeta.default || endpointMeta
      if (endpointMeta.handler) {
        const fetchRequest = await nodeToFetchRequest(req)

        const handlerResponse = await safeHandler(() =>
          endpointMeta.handler({
            ...(extra || {}),
            rawRequest: req, // For Node environments
            request: fetchRequest,
            headers: fetchRequest.headers,
            event: {
              clientId: process.pid,
              request: fetchRequest,
              respondWith: () => undefined,
              waitUntil: () => undefined,
            },
          })
        )

        const { statusCode, statusText, headers, body, ...other } =
          await parseHandlerResponse(handlerResponse, endpointMeta.options)

        if (res) {
          res.statusMessage = statusText
          res.statusCode =
            statusCode >= 300 && statusCode < 400 && mockRedirect
              ? 299
              : statusCode

          for (const [key, value] of Object.entries(headers)) {
            res.setHeader(key, value)
          }

          res.end(body)
        }

        return { statusCode, statusText, headers, body, ...other }
      }
    }
  } catch (error) {
    console.error(error)
    if (!res) return
    res.statusMessage = error.message
    res.statusCode = 500
    return res.end()
  }

  if (!res) return
  res.statusCode = 404
  return res.end()
}
