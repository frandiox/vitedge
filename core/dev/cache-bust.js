export const cacheBust = (resolved) => {
  const url = new URL(resolved.url)

  if (
    url.protocol === 'nodejs:' ||
    url.protocol === 'node:' ||
    url.pathname.includes('/node_modules/')
  ) {
    return resolved
  }

  if (url.pathname.includes('/functions/')) {
    return {
      url: url.href + `?id=${Math.random().toString(36).substring(3)}`,
    }
  }

  return resolved
}
