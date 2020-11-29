// TODO proper type for Vue Router routes when that package exports types (missing in rc.2)

type VitedgeOptions = { routes: any[]; pageProps?: boolean }

declare module 'vitedge' {
  const handler: (
    App: any,
    options: VitedgeOptions,
    hook: (params: {
      app: any
      router: any
      isClient: boolean
      initialState: unknown
    }) => void | Promise<void>
  ) => void

  export default handler
}
