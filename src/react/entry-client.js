import React from 'react'
import viteSSR from 'vite-ssr/react/entry-client'
import { buildPropsRoute } from '../utils/props'

export default function (App, { routes, ...options }, hook) {
  return viteSSR(App, { routes, PropsProvider, ...options }, hook)
}

let lastRouteName

export function PropsProvider({ from, to, children: Page, ...rest }) {
  // This code can run because of a rerrender (same route) or because changing routes.
  // We only want to refresh props in the second case.
  const isChangingRoute = !!lastRouteName && lastRouteName !== to.name
  lastRouteName = to.name

  if (!to.meta.state || isChangingRoute) {
    if (from && to.name === from.name) {
      // Keep state when changing hash/query in the same route
      to.meta.state = from.meta.state
    } else {
      const propsRoute = buildPropsRoute({
        ...to,
        fullPath: to.path,
      })

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

  return React.createElement(Page, { ...rest, ...to.meta.state })
}
