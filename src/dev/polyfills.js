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
