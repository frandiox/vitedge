export function normalizePathname(url) {
  return url.pathname.replace(/(\/|\.\w+)$/, '')
}

export function getEventType({ url, functions }) {
  const path = normalizePathname(url)

  if (path.startsWith('/api/') || !!functions[path]) {
    return 'api'
  }

  if (url.pathname.startsWith('/props/')) {
    return 'props'
  }

  return 'render'
}
