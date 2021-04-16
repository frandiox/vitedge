import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'
import viteSSR from 'vite-ssr/react/entry-client'
import { buildPropsRoute } from '../utils/props'
import { onFunctionReload } from '../dev/hmr'
import { safeHandler } from '../errors'

export { ClientOnly } from 'vite-ssr/react/components'

export default function (App, { routes, ...options }, hook) {
  return viteSSR(App, { routes, PropsProvider, ...options }, async (ctx) => {
    if (import.meta.hot) {
      onFunctionReload(ctx.router.getCurrentRoute, fetchPageProps)
    }

    if (hook) {
      await hook(ctx)
    }
  })
}

function fetchPageProps(route, setState = (route.meta || {}).setState) {
  const propsRoute = buildPropsRoute(route)

  if (propsRoute) {
    safeHandler(() =>
      fetch(propsRoute.fullPath, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }).then((res) =>
        res.status === 299
          ? { data: { __redirect: true, to: res.headers.get('Location') } }
          : res.json().then((data) => ({ data }))
      )
    ).then(({ data }) => {
      route.meta.state = data
      setState(data)
    })
  }

  return !!propsRoute
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

  if (state && state.__redirect) {
    to.meta.state = null
    return React.createElement(Redirect, state)
  }

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

      const isFetching = fetchPageProps(to, setState)

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
