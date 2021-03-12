import { promises as fs } from 'fs'
import projectConfig from '../config.cjs'

const { fnsInDir } = projectConfig

function getUrl(req) {
  const secure =
    req.connection.encrypted || req.headers['x-forwarded-proto'] === 'https'

  return new URL(`${secure ? 'https' : 'http'}://${req.headers.host + req.url}`)
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
    let endpointMeta = await import(
      `${config.root}/${fnsInDir}${functionPath}.js`
    )

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

async function watchDynamicFiles({ config, watcher }) {
  const getFileFromPath = (filepath) => {
    const file = filepath.includes('/')
      ? filepath.split(`/${fnsInDir}/`)[1]
      : filepath

    if (file && !file.includes('/') && /\.[jt]sx?$/i.test(file)) {
      return file.split('.')[0]
    }
  }

  // Dynamic files to serve (functions/sitemap.js, functions/graphql.js, etc.)
  const fnsDirFiles = new Set(
    (await fs.readdir(`${config.root}/${fnsInDir}`))
      .map(getFileFromPath)
      .filter(Boolean)
  )

  watcher.on('add', (path) => {
    const file = getFileFromPath(path)
    file && fnsDirFiles.add(file)
  })

  watcher.on('unlink', (path) => {
    const file = getFileFromPath(path)
    file && fnsDirFiles.delete(file)
  })

  return fnsDirFiles
}

export async function configureServer({ middlewares, config, watcher }) {
  await prepareEnvironment()

  const fnsDirFiles = await watchDynamicFiles({ config, watcher })

  middlewares.use(async function (req, res, next) {
    const url = getUrl(req)

    if (url.pathname.startsWith('/props/')) {
      return await handleFunctionRequest(req, res, {
        config,
        functionPath: url.searchParams.get('propsGetter'),
        extra: url.searchParams.has('data')
          ? JSON.parse(decodeURIComponent(url.searchParams.get('data')))
          : {},
      })
    }

    const normalizedPathname = url.pathname.split('.')[0]

    if (
      url.pathname.startsWith('/api/') ||
      fnsDirFiles.has(normalizedPathname.slice(1))
    ) {
      return await handleFunctionRequest(req, res, {
        config,
        functionPath: normalizedPathname,
        extra: {
          query: url.searchParams,
          url,
        },
      })
    }

    next()
  })
}

/**
 * Returns the initial state used for the first server-side rendered page.
 * It mimics entry-client logic, but runs in the server.
 */
export async function getRenderContext({
  url,
  resolvedEntryPoint: { resolve },
}) {
  url = new URL(url)
  const propsRoute = resolve(url)

  if (propsRoute) {
    const [pathname, search] = propsRoute.fullPath.split('?')
    url.pathname = pathname
    url.search = search

    try {
      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      const initialState = await res.json()
      return { initialState }
    } catch (error) {
      console.log(`Could not get page props for route "${propsRoute.name}"`)
      console.error(error)
    }
  }
}
