import { loadEnv } from '../utils/env.js'

export async function resolveEnvVariables({ mode }) {
  const actualMode = mode || process.env.NODE_ENV || 'production'

  const envVariables = await loadEnv({
    mode: actualMode,
    dry: true,
  })

  const nodeEnv = envVariables.NODE_ENV || process.env.NODE_ENV || actualMode

  return {
    'process.env.MODE': JSON.stringify(actualMode),
    'process.env.NODE_ENV': JSON.stringify(nodeEnv),
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
