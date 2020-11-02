import viteSSR from 'vite-ssr'

export default function (App, { routes }, hook) {
  routes.forEach((route) => {
    route.props = (r) => ({
      ...(r.meta.state || {}),
      ...((r.props === true ? r.params : r.props) || {}),
    })
  })

  return viteSSR(
    App,
    { routes },
    ({ app, router, isClient, baseUrl, request }) => {
      // The 'request' is the original server request
      // and should be used to pass auth/headers to the getProps endpoint

      let isFirstRoute = true

      router.beforeEach(async (to, from, next) => {
        if (isClient && isFirstRoute && window.__INITIAL_STATE__) {
          // Do not get props for the first route since it is
          // already rendered in the server. Instead, use the inital state.
          isFirstRoute = false
          to.meta.state = window.__INITIAL_STATE__ || {}
          return next()
        }

        try {
          const res = await fetch(
            `${baseUrl}/api/state?path=${encodeURIComponent(to.path)}&name=${
              to.name
            }&client=${isClient}`,
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
    }
  )
}
