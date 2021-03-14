import path from 'path'
import express from 'express'
import fetch from 'node-fetch'

const example = process.argv[2]

if (!example) {
  throw new Error('Specify example name in the first argument')
}

const { default: api } = await import(`../${example}/dist/functions.js`)
const { default: pkgJson } = await import(`../${example}/dist/ssr/package.json`)
const { default: ssrBuild } = await import(`../${example}/dist/ssr/main.js`)
const { default: manifest } = await import(
  `../${example}/dist/client/ssr-manifest.json`
)

const router = ssrBuild.default

// Must be polyfilled for SSR
globalThis.fetch = fetch

// This could be Polka, Fastify or any other server
const server = express()

// Serve static files
for (const asset of pkgJson.ssr.assets || []) {
  server.use(
    '/' + asset,
    express.static(
      path.join(process.cwd(), `../${example}/dist/client/${asset}`)
    )
  )
}

// This finds the correct props-getter function from a request URL
async function getPageProps(request) {
  const { propsGetter, ...extra } = router.resolve(request.url) || {}
  const propsMeta = api[propsGetter]

  if (propsMeta) {
    try {
      const { data } = await propsMeta.handler({
        ...extra,
        request,
        headers: request.headers,
      })

      return data
    } catch (error) {
      console.error(error)
      return {}
    }
  } else {
    return {}
  }
}

server.use(express.json(), async (request, response) => {
  const href =
    request.protocol + '://' + request.get('host') + request.originalUrl
  const normalizedPathname = request.path.replace(/(\/|\.\w+)$/, '')

  try {
    // This handles API endpoints and also dynamic files like `/sitemap` or `/graphql`.
    if (normalizedPathname.startsWith('/api/') || !!api[normalizedPathname]) {
      console.log(request.path, request.query)
      const apiMeta = api[normalizedPathname]

      if (apiMeta) {
        const { data } = await apiMeta.handler({
          request: { ...request, url: href },
          query: request.query,
          heders: request.headers,
          url: new URL(href),
        })

        const headers = {
          'content-type': 'application/json',
          ...(apiMeta.options || {}).headers,
        }

        response.set(headers)

        return response.end(
          (headers['content-type'] || '').startsWith('application/json')
            ? JSON.stringify(data)
            : data
        )
      } else {
        // Error
        return response.end('{}')
      }
    }

    // From here, only GET method is supported
    if (request.method !== 'GET' || request.url.includes('favicon.ico')) {
      response.status(404)
      return response.end()
    }

    // This handles SPA page props requests from the browser
    if (request.path.startsWith('/props/')) {
      console.log(request.path, request.query)
      const props = await getPageProps(request)
      return response.end(JSON.stringify(props))
    }

    // If it didn't match anything else up to here, fallback to HTML rendering
    const initialState = await getPageProps(request)
    const { html } = await router.render(href, {
      request,
      initialState,
      // This is used for preloading assets
      // and avoid waterfall requests
      manifest,
      preload: true,
    })

    response.end(html)
  } catch (error) {
    console.error(error)
  }
})

const port = 8080
console.log(`Server started: http://localhost:${port}`)
server.listen(port)
