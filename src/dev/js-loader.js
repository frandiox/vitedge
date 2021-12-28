import { cacheBust, transformEnvStatements } from './loader-utils.js'

export const resolve = async (specifier, context, defaultResolve) => {
  const resolved = defaultResolve(specifier, context, defaultResolve)
  return cacheBust(resolved)
}

// Node >= 16.2
export const load = async (url, context, defaultLoad) => {
  const { format, source } = await defaultLoad(url, context, defaultLoad)
  return { format, source: transformEnvStatements(source, { url }) }
}

// Node < 16.2
export const transformSource = (source, context, defaultTransformSource) => {
  return defaultTransformSource(
    transformEnvStatements(source, context),
    context,
    defaultTransformSource
  )
}
