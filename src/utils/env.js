import path from 'path'
import multienv from 'multienv-loader'
import { getProjectInfo, meta } from '../config.js'

process.env.NODE_ENV = process.env.NODE_ENV || 'development'

export async function loadEnv({ mode = 'development', dry = true } = {}) {
  const { rootDir } = await getProjectInfo()
  return multienv.load({
    filter: (key) => key.startsWith('VITEDGE_') || key === 'NODE_ENV',
    envPath: path.resolve(rootDir, meta.fnsInDir),
    mode,
    dry,
  })
}
