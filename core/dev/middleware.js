import projectConfig from '../config.cjs'

function getUrl(req) {
  const secure =
    req.connection.encrypted || req.headers['x-forwarded-proto'] === 'https'

  return new URL(
    `${secure ? 'https' : 'http'}://${req.headers.host + req.originalUrl}`
  )
}

function nodeToFetchRequest(nodeRequest) {
  return new Promise((resolve, reject) => {
    let data = []
    nodeRequest.on('data', (chunk) => data.push(chunk))
    nodeRequest.on('error', (error) => reject(error))
    nodeRequest.on('end', () => {
      // Simulate a FetchEvent.request https://developer.mozilla.org/en-US/docs/Web/API/Request
      resolve(
        new Request(
          `${nodeRequest.protocol || 'http'}://${nodeRequest.headers.host}${
            nodeRequest.url
          }`,
          {
            ...nodeRequest,
            body: data.length === 0 ? undefined : Buffer.concat(data),
          }
        )
      )
    })
  })
}

async function polyfillWebAPIs() {
  globalThis.atob = (str) => Buffer.from(str, 'base64').toString('binary')
  globalThis.btoa = (str) => Buffer.from(str).toString('base64')

  try {
    const { Crypto } = await import('node-webcrypto-ossl')
    globalThis.crypto = new Crypto()
  } catch {}

  try {
    const fetch = await import('node-fetch')
    globalThis.fetch = fetch.default || fetch
    globalThis.Request = fetch.Request
    globalThis.Response = fetch.Response
  } catch {}
}

async function prepareEnvironment() {
  await polyfillWebAPIs()

  const { loadEnv } = await import('../utils/env.js')

  loadEnv({
    mode: process.env.NODE_ENV || 'development',
    dry: false,
  })
}

async function handleFunctionRequest(
  req,
  res,
  { config, functionPath, extra }
) {
  try {
    const filePath = `${config.root}/${projectConfig.fnsInDir}${functionPath}`
    let endpointMeta = await import(filePath + '.js')

    if (endpointMeta) {
      endpointMeta = endpointMeta.default || endpointMeta
      if (endpointMeta.handler) {
        const fetchRequest = await nodeToFetchRequest(req)

        const { data } = await endpointMeta.handler({
          ...(extra || {}),
          request: fetchRequest,
          headers: fetchRequest.headers,
          event: {
            clientId: process.pid,
            request: fetchRequest,
            respondWith: () => undefined,
            waitUntil: () => undefined,
          },
        })

        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        return res.end(JSON.stringify(data))
      }
    }
  } catch (error) {
    console.error(error)
    res.statusMessage = error.message
    res.statusCode = 500
    return res.end()
  }

  res.statusCode = 404
  return res.end()
}

export async function configureServer({ middlewares, config }) {
  await prepareEnvironment()

  middlewares.use('/api', async function vitedgeApiHandler(req, res) {
    const url = getUrl(req)
    await handleFunctionRequest(req, res, {
      config,
      functionPath: req.originalUrl,
      extra: {
        query: url.searchParams,
        url,
      },
    })
  })

  middlewares.use('/props', async function vitedgePropsHandler(req, res) {
    const { searchParams } = getUrl(req)
    await handleFunctionRequest(req, res, {
      config,
      functionPath: searchParams.get('propsGetter'),
      extra: searchParams.has('data')
        ? JSON.parse(decodeURIComponent(searchParams.get('data')))
        : {},
    })
  })
}
