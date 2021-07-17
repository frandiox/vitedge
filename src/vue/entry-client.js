import { ref } from 'vue'
import viteSSR, { ClientOnly } from 'vite-ssr/vue/entry-client'
import { buildPropsRoute } from '../utils/props'
import { createHead } from '@vueuse/head'
import { onFunctionReload, setupPropsEndpointsWatcher } from '../dev/hmr'
import { safeHandler } from '../errors'

export { ClientOnly }
export { useContext } from 'vite-ssr/vue/entry-client'

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
        setupPropsEndpointsWatcher()
        onFunctionReload(
          () => router.currentRoute.value,
          async (route) => {
            const redirect = await fetchPageProps(route)
            if (redirect) {
              router.replace(redirect)
            } else {
              // Trigger reactivity:
              route.meta.hmr.value = !route.meta.hmr.value
            }
          }
        )
      }

      let isFirstRoute = true
      router.beforeEach(async (to, from) => {
        if (isFirstRoute) {
          isFirstRoute = false
          if (!!to.meta.state) {
            // Do not get props the first time for the entry
            // route since it is already rendered in the server.
            return
          }
        }

        if (from && to.path === from.path) {
          // Keep state when changing hash/query in the same route
          to.meta.state = from.meta.state
          return
        }

        return await fetchPageProps(to)
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
    const { data, redirect } = await safeHandler(async () => {
      const res = await fetch(propsRoute.fullPath, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.status === 299) {
        // 299 is a mock code to bypass fetch opaque responses
        // on 3xx codes for redirection.
        return { redirect: res.headers.get('Location') }
      }

      return { data: await res.json() }
    })

    if (redirect) {
      return redirect
    }

    route.meta.state = data
  }
}
