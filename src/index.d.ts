import type { SharedContext } from 'vite-ssr/utils/types'

declare module 'vitedge' {
  const handler: (
    App: any,
    options: {
      routes: Array<Record<string, any>>
      base?: (params: { url: URL }) => string
      pageProps?: { passToPage: boolean }
      debug?: { mount?: boolean }
      styleCollector?: any
      routerOptions?: {
        scrollBehavior?: any
        linkActiveClass?: string
        linkExactActiveClass?: string
        parseQuery?: any
        stringifyQuery?: any
      }
    },
    hook: (params: {
      app: any
      router: any
      isClient: boolean
      initialState: unknown
      initialRoute: any
    }) => void | Promise<void>
  ) => void

  export default handler

  export const ClientOnly: any
  export const useContext: Omit<SharedContext, 'request' | 'response'>
  export const usePageProps: () => Record<string, any>
}

export type PropsOptions = {
  status?: number
  statusText?: string
  headers?: Record<string, string>
  cache?: {
    api?: number | boolean
    html?: number | boolean
  }
}

type ReturnedPropsPayload = PropsOptions & { data?: any }

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
  statusText?: string
  headers?: Record<string, string>
  cache?: {
    api?: number | boolean
  }
}

type ReturnedApiPayload =
  | (ApiOptions & { data?: any })
  | Omit<Response, keyof Response>

export type ApiEndpoint = {
  options?: ApiOptions
  handler: (payload: {
    event: FetchEvent
    request: Request
    headers: Headers
    url: URL
    query?: Record<string, string | string[]>
    params?: Record<string, string>
  }) => ReturnedApiPayload | Promise<ReturnedApiPayload>
}
