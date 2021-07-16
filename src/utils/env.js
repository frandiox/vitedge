import path from 'path'
import multienv from 'multienv-loader'
import { getProjectInfo, meta } from '../config.js'

export async function loadEnv({ mode = 'development', dry = true } = {}) {
  const { rootDir } = await getProjectInfo()
  return multienv.load({
    filter: (key) => key.startsWith('VITEDGE_') || key === 'NODE_ENV',
    envPath: path.resolve(rootDir, meta.fnsInDir),
    mode,
    dry,
  })
}
