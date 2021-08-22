import { getWranglerConfig } from '../utils/wrangler.js'
import { handleFunctionRequest, normalizePathname } from './request.js'
import { getUrlFromNodeRequest } from '../node/utils.js'

export async function polyfillWebAPIs() {
  if (!globalThis.atob) {
    globalThis.atob = (str) => Buffer.from(str, 'base64').toString('binary')
    globalThis.btoa = (str) => Buffer.from(str).toString('base64')
  }

  try {
    const { Crypto } = await import('node-webcrypto-ossl')
    globalThis.crypto = new Crypto()
  } catch {}

  if (!globalThis.fetch) {
    const fetch = await import('node-fetch')
    globalThis.fetch = fetch.default || fetch
    globalThis.Request = fetch.Request
    globalThis.Response = fetch.Response
    globalThis.Headers = fetch.Headers
    globalThis.FetchError = fetch.FetchError
  }
}

export async function polyfillWorkerAPIs({ config: viteConfig, ...options }) {
  const { StandardsModule, CacheModule, KVModule, WebSocketsModule } =
    await import('miniflare/dist/modules/modules.js')

  const standards = new StandardsModule()
  const cache = new CacheModule()
  const ws = new WebSocketsModule()

  Object.assign(
    globalThis,
    standards.buildSandbox(),
    cache.buildSandbox({ disableCache: true }),
    ws.buildSandbox()
  )

  const wranglerConfig = await getWranglerConfig(viteConfig)
  if (wranglerConfig && (wranglerConfig.kvNamespaces || []).length > 0) {
    const kv = new KVModule()

    Object.assign(
      globalThis,
      kv.buildEnvironment({ kvNamespaces: wranglerConfig.kvNamespaces })
    )
  }

  if (options.httpServer) {
    await setupWorkerWs(options)
  }
}

export async function setupWorkerWs({ httpServer, fnsInputPath }) {
  const { default: WebSocket } = await import('ws')
  const { terminateWebSocket } = await import('miniflare/dist/modules/ws.js')

  const wss = new WebSocket.Server({ noServer: true })
  wss.addListener('connection', async (ws, req) => {
    const url = getUrlFromNodeRequest(req)

    const response = await handleFunctionRequest(req, null, {
      fnsInputPath,
      functionPath: normalizePathname(url),
      extra: { url },
    })

    if (!response || !response.webSocket || response.status !== 101) {
      ws.close(1002, 'Protocol Error')
      console.error(
        new Error(
          'Web Socket request did not return status 101 Switching Protocols response with Web Socket'
        )
      )

      return
    }

    await terminateWebSocket(ws, response.webSocket)
  })

  httpServer.on('upgrade', (req, socket, head) => {
    // Ignore Vite HMR connections
    if (req.headers['sec-websocket-protocol'] !== 'vite-hmr') {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req)
      })
    }
  })
}
