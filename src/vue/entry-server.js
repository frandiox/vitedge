import viteSSR, { ClientOnly } from 'vite-ssr/vue/entry-server'
import { resolvePropsRoute } from './utils'
import { createHead } from '@vueuse/head'

export { ClientOnly }
export { useContext } from 'vite-ssr/vue/entry-server'

export default function (App, { routes, base, ...options }, hook) {
  return {
    resolve: (url) => resolvePropsRoute(routes, url, base),
    render: viteSSR(
      App,
      { routes, base, ...options },
      async ({ app, router, isClient, initialState, initialRoute }) => {
        const head = createHead()
        app.use(head)

        app.component(ClientOnly.name, ClientOnly)

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

        return { head }
      }
    ),
  }
}
