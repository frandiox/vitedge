declare module 'vitedge/node' {
  export const handleEvent: (
    params: {
      functions: any
      router: any
      url: URL
      preload?: boolean
      manifest?: any
      skipSSR?: boolean
    },
    event: Record<string, any>
  ) => Promise<{
    statusCode: number
    statusMessage?: string
    headers?: Record<string, string>
    body: any
    extra?: {
      htmlAttrs?: string
      bodyAttrs?: string
      body?: string
      headTags?: string
      initialState?: any
      dependencies?: string[]
    }
  }>

  export const getEventType: (params: {
    url: URL
    functions: any
  }) => 'props' | 'api' | 'render'
}
