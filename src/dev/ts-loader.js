export { getFormat } from 'ts-node/esm'

import {
  resolve as tsResolve,
  transformSource as tsTransformSource,
} from 'ts-node/esm'
import { cacheBust, transformEnvStatements } from './loader-utils.js'

export const resolve = async (specifier, context, defaultResolve) => {
  const resolved = await tsResolve(specifier, context, defaultResolve)
  return cacheBust(resolved)
}

export const transformSource = (source, context, defaultTransformSource) => {
  return tsTransformSource(
    transformEnvStatements(source, context),
    context,
    defaultTransformSource
  )
}
