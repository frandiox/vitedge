import path from 'path'
import { lookupFile } from './files.js'

const WRANGLER_TOML = 'wrangler.toml'

export function findWranglerFilePath(rootDir, userProvidedPath) {
  let wranglerDir = rootDir
  let wranglerFile = WRANGLER_TOML

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
    formats: [WRANGLER_TOML],
  })

  if (wranglerToml) {
    try {
      const { getWranglerOptions } = await import(
        'miniflare/dist/options/wrangler.js'
      )

      const wranglerConfig = await getWranglerOptions(
        wranglerToml,
        viteConfig.root,
        viteConfig.mode
      )

      return {
        ...wranglerConfig,
        type: (wranglerToml.match(/^\s*type\s*=\s*"(\w+)"\s*$/im) || [])[1],
      }
    } catch (error) {}
  }

  return null
}
