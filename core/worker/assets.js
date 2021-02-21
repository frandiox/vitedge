import meta from '__vitedge_meta__'
import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler'

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

export async function getSsrManifest(event) {
  try {
    const response = await getAssetFromKV(event, {
      mapRequestToAsset: (request) => {
        const url = new URL(request.url)
        url.pathname = '/ssr-manifest.json'
        return mapRequestToAsset(new Request(url.toString(), request))
      },
    })

    if (!response.ok) {
      throw new Error('SSR Manifest was not found in KV')
    }

    return await response.json()
  } catch (error) {
    console.error(error)
    return {}
  }
}
