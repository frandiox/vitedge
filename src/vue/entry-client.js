import { ref } from 'vue'
import viteSSR, { ClientOnly } from 'vite-ssr/vue/entry-client'
import { buildPropsRoute } from '../utils/props'
import { createHead } from '@vueuse/head'
import { onFunctionReload } from '../dev/hmr'

export default function (App, { routes, ...options }, hook) {
  if (import.meta.env.DEV) {
    // Will be used in HMR later
    routes.forEach((route) => {
      route.meta = route.meta || {}
      route.meta.hmr = ref(false)
    })
  }

  return viteSSR(
    App,
    { routes, ...options },
    async ({ app, router, isClient, initialRoute, initialState }) => {
      const head = createHead()
      app.use(head)

      app.component(ClientOnly.name, ClientOnly)

      if (import.meta.hot) {
        onFunctionReload(
          () => router.currentRoute.value,
          async (route) => {
            await fetchPageProps(route)
            // Trigger reactivity:
            route.meta.hmr.value = !route.meta.hmr.value
          }
        )
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
          await fetchPageProps(to)
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

async function fetchPageProps(route) {
  const propsRoute = buildPropsRoute(route)

  if (propsRoute) {
    const res = await fetch(propsRoute.fullPath, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    route.meta.state = await res.json()
  }
}
