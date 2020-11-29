import path from 'path'
import express from 'express'
import fetch from 'node-fetch'
import api from '../dist/functions.js'
import ssrBuild from '../dist/ssr/main.js'

// @ts-ignore
global.fetch = fetch // Must be polyfilled for SSR

const { default: router } = ssrBuild

const server = express()

server.use(
  '/_assets',
  express.static(path.join(process.cwd(), '../dist/client/_assets'))
)

server.use(
  '/favicon.ico',
  express.static(path.join(process.cwd(), '../dist/client/favicon.ico'))
)

async function getPageProps(request) {
  const { propsGetter, ...extra } = router.resolve(request.url)
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

    const initialState = await getPageProps(request)
    const { html } = await router.render({ request, initialState })
    response.end(html)
  } catch (error) {
    console.error(error)
  }
})

const port = 8080
console.log(`Server started: http://localhost:${port}`)
server.listen(port)
