import viteSSR, { ClientOnly } from 'vite-ssr/vue/entry-client'
import { buildPropsRoute } from '../utils/props'
import { addPagePropsGetterToRoutes } from './utils'
import { createHead } from '@vueuse/head'

export default function (App, { routes, pageProps = true, ...options }, hook) {
  if (pageProps) {
    addPagePropsGetterToRoutes(routes)
  }

  return viteSSR(
    App,
    { routes, ...options },
    async ({ app, router, isClient, initialRoute, initialState }) => {
      const head = createHead()
      app.use(head)

      app.component(ClientOnly.name, ClientOnly)

      let isFirstRoute = true
      router.beforeEach(async (to, from, next) => {
        if (isFirstRoute) {
          isFirstRoute = false
          if (
            !!to.meta.state &&
            (!import.meta.env.DEV || import.meta.env.SSR)
          ) {
            // Do not get props the first time for the entry
            // route since it is already rendered in the server.
            return next()
          }
        }

        if (from && to.name === from.name) {
          // Keep state when changing hash/query in the same route
          to.meta.state = from.meta.state
          return next()
        }

        const propsRoute = buildPropsRoute(to)

        if (propsRoute) {
          try {
            const res = await fetch(propsRoute.fullPath, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
            })

            to.meta.state = await res.json()
          } catch (error) {
            console.error(error)
            // redirect to error route
          }
        }

        next()
      })

      if (hook) {
        await hook({ app, router, isClient, initialState, initialRoute })
      }
    }
  )
}
