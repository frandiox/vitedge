import * as esmHooks from 'ts-node/esm'
import { cacheBust, transformEnvStatements } from './loader-utils.js'

export const resolve = async (specifier, context, defaultResolve) => {
  const resolved = await esmHooks.resolve(specifier, context, defaultResolve)
  return cacheBust(resolved)
}

// Node >= 16.2
export const load = (url, context, defaultLoad) => {
  return esmHooks.load(url, context, async (_, modifiedContext) => {
    const { source } = await defaultLoad(url, modifiedContext, defaultLoad)
    return { source: transformEnvStatements(source, { url }) }
  })
}

// Node < 16.2
export const transformSource = (source, context, defaultTransformSource) => {
  return esmHooks.transformSource(
    transformEnvStatements(source, context),
    context,
    defaultTransformSource
  )
}

// Node < 16.2
export const getFormat = esmHooks.getFormat
