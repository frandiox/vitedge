import { loadEnv } from '../utils/env.js'

export async function resolveEnvVariables({ mode, root }) {
  const actualMode = mode || process.env.NODE_ENV || 'production'

  const envVariables = await loadEnv({
    mode: actualMode,
    dry: true,
    root,
  })

  return {
    ...Object.entries(envVariables).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [`process.env.${key}`]: JSON.stringify(value),
      }),
      {}
    ),
    'process.env.': `({}).`,
    'process.env': JSON.stringify(envVariables),
  }
}
