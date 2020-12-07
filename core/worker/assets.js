import meta from '__vitedge_meta__'
import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

export function isStaticAsset(event) {
  const url = new URL(event.request.url)
  return (meta.ssr.assets || []).some((asset) =>
    url.pathname.startsWith('/' + asset)
  )
}

export function handleStaticAsset(event) {
  return getAssetFromKV(event, {})
}
