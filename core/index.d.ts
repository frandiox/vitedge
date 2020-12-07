declare module 'vitedge' {
  import { App } from 'vue'
  import { Router, RouteLocationRaw } from 'vue-router'

  const handler: (
    App: any,
    options: { routes: RouteLocationRaw[]; pageProps?: boolean },
    hook: (params: {
      app: App
      router: Router
      isClient: boolean
      initialState: unknown
    }) => void | Promise<void>
  ) => void

  export default handler
}
