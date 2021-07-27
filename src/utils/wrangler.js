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
