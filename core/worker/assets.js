import meta from '__vitedge_meta__'
import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

export function isStaticAsset(event) {
  const url = new URL(event.request.url)
  return (meta.ssr.assets || []).some((asset) =>
    url.pathname.startsWith('/' + asset)
  )
}

export async function handleStaticAsset(event) {
  const response = await getAssetFromKV(event, {})

  if (response.status < 400) {
    const url = new URL(event.request.url)
    const filename = url.pathname.split('/').pop()

    const maxAge =
      filename.split('.').length > 2
        ? 31536000 // hashed asset, will never be updated
        : 86400 // favico and other public assets

    response.headers.append('cache-control', `public, max-age=${maxAge}`)
  }

  return response
}
