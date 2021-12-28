const envRE = /(\b)import\.meta\.env(\b)/gm
const isFnsFile = (url) =>
  url.protocol === 'file:' &&
  !url.pathname.includes('/node_modules/') &&
  url.pathname.includes('/functions/')

export const cacheBust = (resolved) => {
  const url = new URL(resolved.url)
  return isFnsFile(url)
    ? {
        ...resolved,
        url: url.href + `?id=${Math.random().toString(36).substring(3)}`,
      }
    : resolved
}

export const transformEnvStatements = (source, context) => {
  return isFnsFile(new URL(context.url))
    ? (typeof source === 'string' ? source : source.toString('utf8')).replace(
        envRE,
        '$1process.env$2'
      )
    : source
}
