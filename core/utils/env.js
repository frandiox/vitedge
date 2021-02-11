import path from 'path'
import multienv from 'multienv-loader'
import config from '../config.cjs'

export function loadEnv({ mode = 'development', dry = true } = {}) {
  return multienv.load({
    filter: (key) => key.startsWith('VITEDGE_') || key === 'NODE_ENV',
    envPath: path.resolve(config.rootDir, config.fnsInDir),
    mode,
    dry,
  })
}
