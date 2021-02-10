import { cacheBust } from './cache-bust.js'

export const resolve = async (specifier, context, defaultResolve) => {
  const resolved = defaultResolve(specifier, context, defaultResolve)
  return cacheBust(resolved)
}
