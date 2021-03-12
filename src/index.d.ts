declare module 'vitedge' {
  import { App, Component } from 'vue'
  import { Router, RouteLocationRaw, RouteLocationNormalized } from 'vue-router'

  const handler: (
    App: Component,
    options: {
      routes: RouteLocationRaw[]
      base?: (params: { url: URL }) => string
      pageProps?: { passToPage: boolean }
      debug?: { mount?: boolean }
    },
    hook: (params: {
      app: App
      router: Router
      isClient: boolean
      initialState: unknown
      initialRoute: RouteLocationNormalized
    }) => void | Promise<void>
  ) => void

  export default handler
}

export type PropsOptions = {
  status?: number
  headers?: Record<string, string>
  cache?: {
    api?: number | boolean
    html?: number | boolean
  }
}

type ReturnedPropsPayload = { data: any; options?: PropsOptions }

export type EdgeProps = {
  options?: PropsOptions
  handler: (payload: {
    event: FetchEvent
    request: Request
    headers: Headers
    propsGetter: string
    fullPath: string
    path: string
    hash: string
    href: string
    name?: string
    params?: Record<string, string | string[]>
    query?: Record<string, string | string[]>
  }) => ReturnedPropsPayload | Promise<ReturnedPropsPayload>
}

export type ApiOptions = {
  status?: number
  headers?: Record<string, string>
  cache?: {
    api?: number | boolean
  }
}

type ReturnedApiPayload = { data: any; options?: ApiOptions }

export type ApiEndpoint = {
  options?: ApiOptions
  handler: (payload: {
    event: FetchEvent
    request: Request
    headers: Headers
    url: URL
    query?: Record<string, string | string[]>
  }) => ReturnedApiPayload | Promise<ReturnedApiPayload>
}
