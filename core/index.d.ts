declare module 'vitedge' {
  import { App } from 'vue'
  import { Router, RouteLocationRaw, RouteLocationNormalized } from 'vue-router'

  const handler: (
    App: any,
    options: {
      routes: RouteLocationRaw[]
      base?: ({ url: URL }) => string
      pageProps?: boolean
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
