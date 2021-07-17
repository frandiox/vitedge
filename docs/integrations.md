# Integrations

Here's a list of common modules or libraries integrated with Vitedge.

::: tip Add your own
If you know of any other useful integration, please submit a PR to the docs.
:::

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
