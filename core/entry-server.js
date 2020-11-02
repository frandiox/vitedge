import viteSSR from 'vite-ssr/entry-server'

export default function (App, { routes }, hook) {
  routes.forEach((route) => {
    route.props = (r) => ({
      ...(r.meta.state || {}),
      ...((r.props === true ? r.params : r.props) || {}),
    })
  })
  return viteSSR(App, { routes }, ({ app, router, request, api }) => {
    // The 'request' is the original server request
    // and should be used to pass auth/headers to the getProps endpoint

    router.beforeEach(async (to, from, next) => {
      try {
        to.meta.state = await api.state({
          request,
          params: { path: to.path, name: to.name },
        })
      } catch (error) {
        console.error(error)
        // redirect to error route
      }

      next()
    })
  })
}
