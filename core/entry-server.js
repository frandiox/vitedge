import viteSSR from 'vite-ssr/entry-server'
import {
  addPagePropsGetterToRoutes,
  prepareRouteParams,
  findRoutePropsGetter,
} from './utils/router'

export default function (App, { routes }, hook) {
  addPagePropsGetterToRoutes(routes)

  return viteSSR(App, { routes }, async ({ app, router, request, api }) => {
    // The 'request' is the original server request
    // and should be used to pass auth/headers to the getProps endpoint

    router.beforeEach(async (to, from, next) => {
      const apiRoute = buildApiRoute(to, from)

      if (
        apiRoute &&
        Object.prototype.hasOwnProperty.call(api, apiRoute.propsGetter)
      ) {
        const { handler, options = {} } = api[apiRoute.propsGetter]

        try {
          to.meta.state = await handler({
            request,
            ...apiRoute.data,
          })

          to.meta.response = {
            options,
            apiRoute,
          }
        } catch (error) {
          console.error(error)
          // redirect to error route
        }
      }

      next()
    })

    if (hook) {
      await hook({ app, router, isClient: false })
    }
  })
}
