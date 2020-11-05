import viteSSR from 'vite-ssr/entry-server'
import { addPagePropsGetterToRoutes } from './utils/router'

export default function (App, { routes }, hook) {
  addPagePropsGetterToRoutes(routes)

  return viteSSR(App, { routes }, async ({ app, router, request, api }) => {
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

    if (hook) {
      await hook({ app, router, isClient: false })
    }
  })
}
