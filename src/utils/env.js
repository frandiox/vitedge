import path from 'path'
import { loadEnv as viteLoadEnv } from 'vite'
import { getProjectInfo, meta } from '../config.js'

export async function loadEnv({ mode = 'development', dry = true, root } = {}) {
  if (!root) {
    const info = await getProjectInfo()
    root = path.resolve(info.rootDir, meta.fnsInDir)
  }

  const env = await viteLoadEnv(mode, root, 'VITEDGE_')
  env.MODE = mode
  env.NODE_ENV = process.env.VITE_USER_NODE_ENV || process.env.NODE_ENV || mode
  env.PROD = env.NODE_ENV === 'production'
  env.DEV = !env.PROD

  if (!dry) {
    for (const [key, value] of Object.entries(env)) {
      process.env[key] = value
    }
  }

  return env
}
