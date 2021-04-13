export function normalizePathname(url) {
  return url.pathname.replace(/(\/|\.\w+)$/, '')
}

export function getEventType({ url, functions }) {
  const path = normalizePathname(url)

  if (url.pathname.startsWith('/props/')) {
    return 'props'
  }

  if (path.startsWith('/api/') || !!functions[path]) {
    return 'api'
  }

  return 'render'
}
