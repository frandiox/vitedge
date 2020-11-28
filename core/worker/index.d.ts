type WillResponse = void | Promise<void>
type DidResponse = void | Response | Promise<void | Response>

declare module 'vitedge/worker' {
  export const handleEvent: (
    event: Event,
    options?: {
      // Options
      http2ServerPush?: {
        destinations: ('script' | 'style')[]
      }

      // Hooks
      willRequestAsset?: ({ event: Event }) => WillResponse
      willRequestApi?: ({ event: Event, url: URL, query: any }) => WillResponse
      willRequestProps?: ({
        event: Event,
        url: URL,
        query: any,
      }) => WillResponse
      willRequestRender?: ({ event: Event }) => WillResponse

      didRequestAsset?: ({ event: Event, response: Response }) => DidResponse
      didRequestApi?: ({
        event: Event,
        response: Response,
        url: URL,
        query: any,
      }) => DidResponse
      didRequestProps?: ({
        event: Event,
        response: Response,
        url: URL,
        query: any,
      }) => DidResponse
      didRequestRender?: ({
        event: Event,
        response: Response,
        html: string,
      }) => DidResponse
    }
  ) => Promise<Event>
}
