import viteSSR from 'vite-ssr/entry-server'
import { addPagePropsGetterToRoutes, resolvePropsRoute } from './utils/router'

export default function (App, { routes, pageProps = true }, hook) {
  if (pageProps) {
    addPagePropsGetterToRoutes(routes)
  }

  return {
    resolve: (url) => resolvePropsRoute(routes, url),
    render: viteSSR(App, { routes }, async ({ app, router, initialState }) => {
      router.beforeEach((to, from, next) => {
        to.meta.state = initialState || {}
        next()
      })

      if (hook) {
        await hook({ app, router, isClient: false, initialState })
      }
    }),
  }
}
