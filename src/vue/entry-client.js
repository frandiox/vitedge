import viteSSR, { ClientOnly } from 'vite-ssr/vue/entry-client'
import { buildPropsRoute, findRoutePropsGetter } from '../utils/props'
import { createHead } from '@vueuse/head'

export default function (App, { routes, ...options }, hook) {
  return viteSSR(
    App,
    { routes, ...options },
    async ({ app, router, isClient, initialRoute, initialState }) => {
      const head = createHead()
      app.use(head)

      app.component(ClientOnly.name, ClientOnly)

      async function getPageProps(route) {
        const propsRoute = buildPropsRoute(route)

        if (propsRoute) {
          const res = await fetch(propsRoute.fullPath, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          })

          route.meta.state = await res.json()
        }
      }

      if (import.meta.hot) {
        import.meta.hot.on('functions-reload', async (data) => {
          const propsGetter = findRoutePropsGetter(router.currentRoute.value)
          if (propsGetter === data.path) {
            console.info('Reloading', data.path)

            // TODO make this reactive?
            await getPageProps(router.currentRoute.value)
          }
        })
      }

      let isFirstRoute = true
      router.beforeEach(async (to, from, next) => {
        if (isFirstRoute) {
          isFirstRoute = false
          if (!!to.meta.state) {
            // Do not get props the first time for the entry
            // route since it is already rendered in the server.
            return next()
          }
        }

        if (from && to.path === from.path) {
          // Keep state when changing hash/query in the same route
          to.meta.state = from.meta.state
          return next()
        }

        try {
          await getPageProps(to)
        } catch (error) {
          console.error(error)
          // redirect to error route
        }

        next()
      })

      if (hook) {
        await hook({ app, router, isClient, initialState, initialRoute })
      }
    }
  )
}
