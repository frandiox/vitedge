# Integrations & How-tos

Here's a list of common modules or libraries integrated with Vitedge.

::: tip Add your own
If you know of any other useful integration, please submit a PR to the docs.
:::

## Cloudflare Workers

### WebSockets

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

## Vue

### Pinia (state management)

[Pinia](https://pinia.esm.dev/) can be integrated as follows:

```js
import vitedge from 'vitedge'
import App from './App'
import routes from './routes'
import { createPinia } from 'pinia'

export default vitedge(App, { routes }, ({ app, initialState }) => {
  const pinia = createPinia()

  // Sync initialState with the store:
  if (import.meta.env.SSR) {
    initialState.pinia = pinia.state.value
  } else {
    pinia.state.value = initialState.pinia
  }

  app.use(pinia)
})
```

## React

### CSS in JS (Style Collectors)

There are many CSS-in-JS solutions for React and each of them implements a custom way to extract CSS during SSR. Vitedge provides a Style Collector API to let you hook into the rendering process and extract the CSS. Common implementations are provided out of the box and just need to be imported as follows:

```js
import App from './App.jsx'
import routes from './routes'
import vitedge from 'vitedge'
import styleCollector from 'vitedge/react/style-collectors/styled-components.js'

export default vitedge(App, { routes, styleCollector }, (ctx) => {})
```

Currently, the following style collectors are provided from `vitedge/react/style-collectors`:

- `styled-components` - [Link](https://styled-components.com/).
- `material-ui-core-v4` - [Link](https://material-ui.com/).
- `emotion` - [Link](https://emotion.sh/). Related [issue](https://github.com/emotion-js/emotion/issues/2446).

You can create your own (or modify an existing one) following the [examples shown here](https://github.com/frandiox/vite-ssr/blob/master/src/react/style-collectors). Please, consider submitting Pull Requests to add new style collectors for other libraries.

### Apollo GraphQL

[Apollo GraphQL](https://www.apollographql.com/docs/react/) in React works by utilizing a cache instance:

```js
import vitedge from 'vitedge'
import App from './App'
import routes from './routes'
import { InMemoryCache } from '@apollo/client'

export default vitedge(
  App,
  {
    routes,
    transformState(state, defaultTransformer) {
      if (import.meta.env.SSR) {
        // Make Apollo Cache serializable in SSR
        state.apolloCache = state.apolloCache.extract()
      }

      // Continue default serialization/deserializaion
      return defaultTransformer(state)
    },
  },
  ({ initialState }) => {
    // Main initialization hook
    if (import.meta.env.SSR) {
      // Create a new Apollo Cache instance in SSR.
      initialState.apolloCache = new InMemoryCache()
    } else {
      // Hydrate the serialized Apollo Cache in browser.
      initialState.apolloCache = new InMemoryCache().restore(
        initialState.apolloCache
      )
    }
  }
)
```

```js
// App.jsx
import { ApolloClient, ApolloProvider, createHttpLink } from '@apollo/client'

// -- Later, use this cache instance to initialize Apollo Client where needed.
export default function App({ isClient, url, initialState }) {
  const client = new ApolloClient({
    link: createHttpLink({
      uri: `${isClient ? '' : url.origin}/graphql`,
      credentials: 'same-origin',
    }),
    ssrMode: !isClient,
    cache: initialState.apolloCache,
    credentials: 'same-origin',
  })

  return <ApolloProvider client={client}>...</ApolloProvider>
}
```
