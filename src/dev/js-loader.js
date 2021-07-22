import { cacheBust, transformEnvStatements } from './loader-utils.js'

export const resolve = async (specifier, context, defaultResolve) => {
  const resolved = defaultResolve(specifier, context, defaultResolve)
  return cacheBust(resolved)
}

export const transformSource = (source, context, defaultTransformSource) => {
  return defaultTransformSource(
    transformEnvStatements(source, context),
    context,
    defaultTransformSource
  )
}
