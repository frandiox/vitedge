import viteSSR from 'vite-ssr/entry-client'
import { addPagePropsGetterToRoutes, buildPropsRoute } from './utils/router'

export default function (App, { routes }, hook) {
  addPagePropsGetterToRoutes(routes)

  return viteSSR(App, { routes }, async ({ app, router }) => {
    let isFirstRoute = true

    router.beforeEach(async (to, from, next) => {
      if (isFirstRoute && window.__INITIAL_STATE__) {
        // Do not get props for the first route since it is
        // already rendered in the server. Instead, use the inital state.
        isFirstRoute = false
        to.meta.state = window.__INITIAL_STATE__ || {}
        return next()
      }

      const propsRoute = buildPropsRoute(to)

      if (propsRoute) {
        try {
          const res = await fetch(propsRoute.fullpath, {
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
      await hook({ app, router, isClient: true })
    }
  })
}
