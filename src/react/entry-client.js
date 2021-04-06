import React, { useState } from 'react'
import viteSSR from 'vite-ssr/react/entry-client'
import { buildPropsRoute, findRoutePropsGetter } from '../utils/props'

export { ClientOnly } from 'vite-ssr/react/components'

export default function (App, { routes, ...options }, hook) {
  return viteSSR(App, { routes, PropsProvider, ...options }, async (ctx) => {
    if (import.meta.hot) {
      import.meta.hot.on('functions-reload', async (data) => {
        const currentRoute = ctx.router.getCurrentRoute()
        const propsGetter = findRoutePropsGetter(currentRoute)
        if (propsGetter === data.path) {
          console.info('Reloading', data.path)
          fetchPageProps(currentRoute, currentRoute.meta.setState)
        }
      })
    }

    if (hook) {
      await hook(ctx)
    }
  })
}

function fetchPageProps(to, setState) {
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
        to.meta.state = { error }
        setState(to.meta.state)
      })
  }
}

let lastRoutePath

function PropsProvider({
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

  if (import.meta.env.DEV) {
    // For props HMR
    to.meta.setState = setState
  }

  let isLoadingProps = false
  let isRevalidatingProps = false

  if (!to.meta.state || isChangingRoute) {
    if (from && to.path === from.path) {
      // Keep state when changing hash/query in the same route
      to.meta.state = from.meta.state || {}
      setState(from.meta.state)
    } else {
      to.meta.state = {}

      const isFetching = fetchPageProps(propsRoute, to, setState)

      if (isFetching) {
        if (state) {
          isRevalidatingProps = true
        } else {
          isLoadingProps = true
        }
      }
    }
  }

  const { passToPage } = pagePropsOptions || {}
  return React.createElement(Page, {
    isLoadingProps,
    isRevalidatingProps,
    ...((passToPage && state) || {}),
    ...rest,
  })
}
