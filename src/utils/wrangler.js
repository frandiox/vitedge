import path from 'path'
import { lookupFile } from './files.js'

export function findWranglerFilePath(rootDir, userProvidedPath) {
  let wranglerDir = rootDir
  let wranglerFile = 'wrangler.toml'

  if (userProvidedPath) {
    wranglerDir = path.dirname(userProvidedPath)
    wranglerFile = path.basename(userProvidedPath)
  }

  return lookupFile({
    dir: wranglerDir,
    formats: [wranglerFile],
    pathOnly: true,
    bubble: false,
  })
}

export async function getWranglerConfig(viteConfig) {
  const wranglerToml = lookupFile({
    dir: viteConfig.root,
    formats: ['wrangler.toml'],
  })

  if (wranglerToml) {
    try {
      const { getWranglerOptions } = await import(
        'miniflare/dist/options/wrangler.js'
      )

      return await getWranglerOptions(
        wranglerToml,
        viteConfig.root,
        viteConfig.mode
      )
    } catch (error) {}
  }

  return null
}
