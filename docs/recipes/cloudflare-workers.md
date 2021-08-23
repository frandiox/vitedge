# Cloudflare Workers

Here's a list of how-tos and common libraries integrated with Cloudflare Workers and Vitedge.

::: tip Add your own
If you know of any other useful how-to or integration, please submit a PR to the docs.
:::

## WebSockets

- [WebSockets Reference](https://developers.cloudflare.com/workers/runtime-apis/websockets)
- [Using WebSockets](https://developers.cloudflare.com/workers/learning/using-websockets)

CF Workers have an API called `WebSocketPair` that let us receive and send messages via WebSockets easily.
We just need to choose a place to locate the `WebSocketPair` to receive the request. For example, we can choose `<root>/functions/ws.ts` file, which will enable `wss://my-domain.com/ws` to establish WS connections.

The handler for a WS connection would look like this:

```ts
import type { ApiEndpoint } from 'vitedge'

export default <ApiEndpoint>{
  async handler({ request }) {
    const upgradeHeader = request.headers.get('Upgrade')
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 })
    }

    const webSocketPair = new WebSocketPair()
    const [client, server] = Object.values(webSocketPair)

    server.accept()
    server.addEventListener('message', (event) => {
      console.log('Message from browser:', event.data)
    })

    return new Response(null, {
      status: 101,
      webSocket: client,
    })
  },
}
```

Note that `WebSocketPair` types are [not yet added to `@cloudflare/workers-types`](https://github.com/cloudflare/workers-types/issues/84) so you might need to use `// @ts-ignore`.

Then, this can be consumed from the browser with normal WebSocket:

```js
const ws = new WebSocket('wss://my-domain.com/ws')
ws.send('Hello World!')
```

Note that in development mode, the URL would rather look like `ws://localhost:3000/ws`.
