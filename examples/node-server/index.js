import path from 'path'
import express from 'express'
import { handleEvent, getEventType } from 'vitedge/node/index.js'

const example = process.argv[2]

if (!example) {
  throw new Error('Specify example name in the first argument')
}

const { default: functions } = await import(`../${example}/dist/functions.js`)
const { default: packageJson } = await import(
  `../${example}/dist/ssr/package.json`,
  { assert: { type: 'json' } }
)
const { default: router } = await import(
  `../${example}/dist/ssr/${packageJson.main}`
)
const { default: manifest } = await import(
  `../${example}/dist/client/ssr-manifest.json`,
  { assert: { type: 'json' } }
)

// This could be Polka, Fastify or any other server
const server = express()

// Serve static files. Providers like Vercel or Netlify have specific ways to do this.
server.use(
  express.static(path.join(process.cwd(), `../${example}/dist/client`))
)

server.use(async (request, response) => {
  // Generate a full URL
  const url = new URL(
    request.protocol + '://' + request.get('host') + request.originalUrl
  )

  try {
    const type = getEventType({ url, functions }) // api | props | render
    console.info('-', type, url.pathname)

    const { statusCode, body, headers } = await handleEvent(
      { url, functions, router, manifest, preload: true },
      // This will be directly passed to api/props handlers
      { request, method: request.method, headers: request.headers }
    )

    response
      .set(headers || {})
      .status(statusCode || 200)
      .end(body)
  } catch (error) {
    console.error(error)
    response.status(500).end(error.message)
  }
})

const port = 8080
console.log(`Server started: http://localhost:${port}`)
server.listen(port)
