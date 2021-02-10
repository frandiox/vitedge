export { getFormat, transformSource } from 'ts-node/esm'
import { resolve as tsResolve } from 'ts-node/esm'
import { cacheBust } from './cache-bust.js'

export const resolve = async (specifier, context, defaultResolve) => {
  const resolved = await tsResolve(specifier, context, defaultResolve)
  return cacheBust(resolved)
}
