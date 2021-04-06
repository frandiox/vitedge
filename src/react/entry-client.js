import React, { useState } from 'react'
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

  const [state, setState] = useState(to.meta.state)

  if (!to.meta.state || isChangingRoute) {
    if (from && to.path === from.path) {
      // Keep state when changing hash/query in the same route
      to.meta.state = from.meta.state || {}
      setState(from.meta.state)
    } else {
      to.meta.state = {}

      const propsRoute = buildPropsRoute(to)

      if (propsRoute) {
        fetch(propsRoute.fullPath, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
          .then((res) => res.json())
          .then((resolvedState) => {
            to.meta.state = resolvedState
            setState(resolvedState)
          })
          .catch((error) => {
            console.error(error)
          })
      }
    }
  }

  const { passToPage } = pagePropsOptions || {}
  return React.createElement(Page, {
    ...((passToPage && state) || {}),
    ...rest,
  })
}
