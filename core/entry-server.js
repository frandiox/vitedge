export { Helmet, ClientOnly } from 'vite-ssr/components'
import viteSSR from 'vite-ssr/entry-server'
import { addPagePropsGetterToRoutes, resolvePropsRoute } from './utils/router'

export default function (
  App,
  { routes, base, pageProps = true, ...options },
  hook
) {
  if (pageProps) {
    addPagePropsGetterToRoutes(routes)
  }

  return {
    resolve: (url) => resolvePropsRoute(routes, url, base),
    render: viteSSR(
      App,
      { routes, base, ...options },
      async ({ app, router, isClient, initialState, initialRoute }) => {
        router.beforeEach((to, from, next) => {
          to.meta.state = initialState || {}
          next()
        })

        if (hook) {
          await hook({
            app,
            router,
            isClient,
            initialState,
            initialRoute,
          })
        }
      }
    ),
  }
}
