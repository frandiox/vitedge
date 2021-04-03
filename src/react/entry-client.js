import React from 'react'
import viteSSR from 'vite-ssr/react/entry-client'
import { buildPropsRoute } from '../utils/props'

export { ClientOnly } from 'vite-ssr/react/components'

export default function (App, { routes, ...options }, hook) {
  return viteSSR(App, { routes, PropsProvider, ...options }, hook)
}

let lastRoutePath

export function PropsProvider({
  from,
  to,
  pagePropsOptions,
  children: Page,
  ...rest
}) {
  // This code can run because of a rerrender (same route) or because changing routes.
  // We only want to refresh props in the second case.
  const isChangingRoute = !!lastRoutePath && lastRoutePath !== to.path
  lastRoutePath = to.path

  if (!to.meta.state || isChangingRoute) {
    if (from && to.path === from.path) {
      // Keep state when changing hash/query in the same route
      to.meta.state = from.meta.state
    } else {
      const propsRoute = buildPropsRoute(to)

      if (propsRoute) {
        const promise = fetch(propsRoute.fullPath, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
          .then((res) => res.json())
          .then((state) => {
            to.meta.state = state
          })
          .catch((error) => {
            console.error(error)
          })

        // Suspense magic
        throw promise
      }
    }
  }

  const { passToPage } = pagePropsOptions || {}
  return React.createElement(Page, {
    ...(passToPage ? to.meta.state : {}),
    ...rest,
  })
}
