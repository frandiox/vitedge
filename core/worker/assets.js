import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

export function isStaticAsset(event) {
  return (
    event.request.url.includes('/_assets/') ||
    event.request.url.includes('/favicon.ico') ||
    event.request.url.includes('/robots.txt') ||
    event.request.url.includes('/sitemap.xml')
  )
}

export function handleStaticAsset(event) {
  return getAssetFromKV(event, {})
}
