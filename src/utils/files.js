import fs from 'fs'
import path from 'path'
import fg from 'fast-glob'
import { createRequire } from 'module'
import { meta } from '../config.js'

export function requireJson(path) {
  return createRequire(import.meta.url)(path)
}

export function lookupFile({ dir, formats, pathOnly = false, bubble = false }) {
  for (const format of formats) {
    const fullPath = path.join(dir, format)
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return pathOnly ? fullPath : fs.readFileSync(fullPath, 'utf-8')
    }
  }

  if (bubble) {
    const parentDir = path.dirname(dir)
    if (parentDir !== dir) {
      return lookupFile(parentDir, formats, pathOnly)
    }
  }
}

export function resolveFunctionsFiles(globs, extensions = ['js', 'ts']) {
  return fg(
    globs.map((glob) => `${glob}.{${extensions.join(',')}}`),
    {
      ignore: ['node_modules', '.git', `**/${meta.fnsInDir}/index.*`],
      onlyFiles: true,
    }
  )
}
