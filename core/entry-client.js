import viteSSR from 'vite-ssr/entry-client'

export default function (App, { routes }, hook) {
  routes.forEach((route) => {
    route.props = (r) => ({
      ...(r.meta.state || {}),
      ...((r.props === true ? r.params : r.props) || {}),
    })
  })

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

      try {
        const res = await fetch(
          `/api/state?path=${encodeURIComponent(to.path)}&name=${to.name}`,
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

      next()
    })

    if (hook) {
      await hook({ app, router, isClient: true })
    }
  })
}
