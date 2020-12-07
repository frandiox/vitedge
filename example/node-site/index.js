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
      const { data } = await propsMeta.handler({ request, ...extra })
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
  try {
    if (request.path.startsWith('/api/')) {
      console.log(request.path, request.query)
      const apiMeta = api[request.path]

      if (apiMeta) {
        const { data } = await apiMeta.handler({
          request: request,
          params: request.query,
        })

        return response.end(JSON.stringify(data))
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

    const url =
      request.protocol + '://' + request.get('host') + request.originalUrl
    const initialState = await getPageProps(request)
    const { html } = await router.render({
      request: { ...request, url },
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
