import viteSSR from 'vite-ssr/entry-client'
import {
  addPagePropsGetterToRoutes,
  prepareRouteParams,
  findRoutePropsGetter,
} from './utils/router'

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

      const propsGetter = findRoutePropsGetter(to, from)

      if (propsGetter) {
        try {
          const params = prepareRouteParams(to, { stringify: true })
          const querystring = new URLSearchParams(params).toString()

          const res = await fetch(
            `/api/${propsGetter}${querystring ? `?${querystring}` : ''}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          )

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
