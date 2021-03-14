import viteSSR from 'vite-ssr/react/entry-server'
import { resolvePropsRoute } from './utils'

export default function (App, { routes, base, ...options }, hook) {
  return {
    resolve: (url) => resolvePropsRoute(routes, url, base),
    render: viteSSR(App, { routes, base, ...options }, hook),
  }
}
