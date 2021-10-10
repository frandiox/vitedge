import { viteSSR } from 'vite-ssr/core/entry-server'
import { buildPropsRoute } from '../utils/props'

export default function () {
  const args = [...arguments]
  const hook = args.pop()
  const resolver = args.shift()
  const options = args.shift()

  if (typeof hook !== 'function') {
    throw new Error('The last parameter must be a function hook')
  }

  return {
    resolve: (url) => {
      const resolvedRoute = resolver && resolver(url)
      if (resolvedRoute) {
        return buildPropsRoute({
          name: url.pathname.slice(1),
          href: url.href,
          path: url.pathname,
          hash: url.hash,
          query: Object.fromEntries(url.searchParams),
          ...resolvedRoute,
        })
      }
    },
    render: viteSSR(options || {}, hook),
  }
}
