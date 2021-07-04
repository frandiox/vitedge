import { resolveConfig } from 'vite'
export { default as meta } from './meta.cjs'

export async function getProjectInfo(mode) {
  const config = await resolveConfig(
    {},
    'build',
    mode || process.env.MODE || process.env.NODE_ENV
  )

  const configFileName = config.configFile || ''

  return {
    config,
    rootDir: config.root,
    isTS: configFileName.endsWith('.ts'),
    isMJS: configFileName.endsWith('.mjs'),
  }
}
