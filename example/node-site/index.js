import path from 'path'
import express from 'express'
import fetch from 'node-fetch'
import api from '../dist/functions.js'
import ssrBuild from '../dist/ssr/main.js'
import pkgJson from '../dist/ssr/package.json'

// @ts-ignore
global.fetch = fetch // Must be polyfilled for SSR

const { default: router } = ssrBuild

const server = express()

for (const asset of pkgJson.ssr.assets || []) {
  server.use(
    '/' + asset,
    express.static(path.join(process.cwd(), '../dist/client/' + asset))
  )
}

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

server.get('*', async (request, response) => {
  const href =
    request.protocol + '://' + request.get('host') + request.originalUrl
  const normalizedPathname = request.path.replace(/(\/|\.\w+)$/, '')

  try {
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
          ...(apiMeta.options.headers || {}),
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

    if (request.path.startsWith('/props/')) {
      console.log(request.path, request.query)
      const props = await getPageProps(request)
      return response.end(JSON.stringify(props))
    }

    const initialState = await getPageProps(request)
    const { html } = await router.render({
      request: { ...request, url: href },
      initialState,
    })
    response.end(html)
  } catch (error) {
    console.error(error)
  }
})

const port = 8080
console.log(`Server started: http://localhost:${port}`)
server.listen(port)
