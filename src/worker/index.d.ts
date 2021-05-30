type WillResponse = void | Promise<void>
type DidResponse = void | Response | Promise<void | Response>

declare module 'vitedge/worker' {
  export function handleEvent(
    event: FetchEvent,
    options?: {
      // Options
      http2ServerPush?: {
        destinations: ('script' | 'style')[]
      }

      // Hooks
      willRequestAsset?: (params: { event: FetchEvent }) => WillResponse
      willRequestApi?: (params: {
        event: FetchEvent
        url: URL
        query: any
      }) => WillResponse
      willRequestProps?: (params: {
        event: FetchEvent
        url: URL
        query: any
      }) => WillResponse
      willRequestRender?: (params: { event: FetchEvent }) => WillResponse

      didRequestAsset?: (params: {
        event: FetchEvent
        response: Response
      }) => DidResponse
      didRequestApi?: (params: {
        event: FetchEvent
        response: Response
        url: URL
        query: any
      }) => DidResponse
      didRequestProps?: (params: {
        event: FetchEvent
        response: Response
        url: URL
        query: any
      }) => DidResponse
      didRequestRender?: (params: {
        event: FetchEvent
        response: Response
        html: string
      }) => DidResponse
    }
  ): Promise<Response>
}
