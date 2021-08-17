import type { ApiEndpoint } from 'vitedge'

// This is an example for handling WS connections.
// Usage in browser:
// const ws = new WebSocket('ws://localhost:3000/ws')
// ws.send('hello world')

export default <ApiEndpoint>{
  async handler({ request }) {
    const upgradeHeader = request.headers.get('Upgrade')
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 })
    }

    // @ts-ignore
    const webSocketPair = new WebSocketPair()
    const [client, server] = Object.values(webSocketPair)

    server.accept()
    server.addEventListener('message', (event) => {
      console.log('Message from browser:', event.data)
    })

    return new Response(null, {
      status: 101,
      // @ts-ignore
      webSocket: client,
    })
  },
}
