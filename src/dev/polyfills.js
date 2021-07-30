import { lookupFile } from '../utils/files.js'

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

export async function polyfillWorkerAPIs(viteConfig) {
  const { StandardsModule, CacheModule, KVModule, EventsModule } = await import(
    'miniflare/dist/modules/modules.js'
  )

  const standards = new StandardsModule()
  const events = new EventsModule()
  const cache = new CacheModule()

  Object.assign(
    globalThis,
    standards.buildSandbox(),
    events.buildSandbox(),
    cache.buildSandbox({ disableCache: true })
  )

  const wranglerToml = lookupFile({
    dir: viteConfig.root,
    formats: ['wrangler.toml'],
  })

  if (wranglerToml) {
    const { getWranglerOptions } = await import(
      'miniflare/dist/options/wrangler.js'
    )

    const wranglerConfig = await getWranglerOptions(
      wranglerToml,
      viteConfig.root,
      viteConfig.mode
    )

    if (wranglerConfig && (wranglerConfig.kvNamespaces || []).length > 0) {
      const kv = new KVModule()

      Object.assign(
        globalThis,
        kv.buildEnvironment({ kvNamespaces: wranglerConfig.kvNamespaces })
      )
    }
  }
}
