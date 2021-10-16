# React

Here's a list of how-tos and common libraries integrated with React and Vitedge.

::: tip Add your own
If you know of any other useful how-to or integration, please submit a PR to the docs.
:::

## CSS in JS (Style Collectors)

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

## React Query

[React Query](https://react-query.tanstack.com/) is a very handy library to handle data fetching and synchronization:

```js
import vitedge from 'vitedge'
import App from './App'
import routes from './routes'
import { QueryClient, hydrate, dehydrate } from 'react-query'

export default vitedge(App, { routes }, (context) => {
  // Create a fresh client (once per request) and
  // specify suspense option by default for all queries
  // so the server can await for them.
  const client = new QueryClient({
    defaultOptions: { queries: { suspense: true } },
  })

  // Save the client in the context to make it
  // available in the App root function later
  context.reactQueryClient = client

  // Sync initialState and ReactQuery state:
  if (import.meta.env.SSR) {
    // Instruct how to access ReactQuery state after SSR:
    context.initialState.reactQuery = { toJSON: () => dehydrate(client) }
  } else {
    // Hydrate ReactQuery client in browser using existing state:
    hydrate(client, context.initialState.reactQuery)
  }
})

```

```js
import { QueryClientProvider } from 'react-query'

function App({ reactQueryClient }) {
  return (
    <QueryClientProvider client={reactQueryClient}>...</QueryClientProvider>
  )
}
```

## Apollo GraphQL

[Apollo GraphQL](https://www.apollographql.com/docs/react/) in React works by utilizing a cache instance:

```js
import vitedge from 'vitedge'
import App from './App'
import routes from './routes'
import { InMemoryCache } from '@apollo/client'

export default vitedge(App, { routes }, (context) => {
  // Create a new Apollo cache (once per request)
  // and make it available in the App function context
  const cache = new InMemoryCache()
  context.apolloCache = cache

  // Sync initialState and Apollo cache:
  if (import.meta.env.SSR) {
    // Placeholder for Apollo cache state during SSR:
    context.initialState.apolloState = { toJSON: () => cache.extract() }
  } else {
    // Hydrate the Apollo cache in browser using existing state:
    cache.restore(context.initialState.apolloState)
  }
})
```

```js
// App.jsx
import { ApolloClient, ApolloProvider, createHttpLink } from '@apollo/client'

// -- Later, use the created cache instance to initialize Apollo Client.
export default function App({ isClient, apolloCache }) {
  const client = new ApolloClient({
    link: createHttpLink({ uri: '/graphql', credentials: 'same-origin' }),
    ssrMode: !isClient,
    cache: apolloCache,
    credentials: 'same-origin',
  })

  return <ApolloProvider client={client}>...</ApolloProvider>
}
```
