# Vue

Here's a list of how-tos and common libraries integrated with Vue and Vitedge.

::: tip Add your own
If you know of any other useful how-to or integration, please submit a PR to the docs.
:::

## Pinia

State management stores with [Pinia](https://pinia.esm.dev/) can be integrated as follows:

```js
import vitedge from 'vitedge'
import App from './App'
import routes from './routes'
import { createPinia } from 'pinia'

export default vitedge(App, { routes }, ({ app, initialState }) => {
  // Make sure the store is created in the main hook, not outside!
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

## Vuex

State management stores with [Vuex](https://next.vuex.vuejs.org/) can be integrated as follows:

```js
import vitedge from 'vitedge'
import App from './App'
import routes from './routes'
import { createStore } from 'vuex'

export default vitedge(App, { routes }, ({ app, initialState }) => {
  // Make sure the store is created in the main hook, not outside!
  const store = createStore()

  // Sync initialState with the store:
  if (import.meta.env.SSR) {
    initialState.store = store.state
  } else {
    store.replaceState(initialState.store)
  }

  app.use(store)
})
```

## URQL

A GraphQL client that is growing in popularity, [URQL](https://formidable.com/open-source/urql/), can be integrated like this:

```js
import vitedge from 'vitedge'
import App from './App'
import routes from './routes'
import urql from '@urql/vue'
import {
  dedupExchange,
  cacheExchange,
  fetchExchange,
  ssrExchange,
} from '@urql/core'

export default vitedge(App, { routes }, ({ app, initialState, isClient }) => {
  const ssrCache = ssrExchange({ isClient, staleWhileRevalidate: true })

  // Sync initialState with the client cache:
  if (import.meta.env.SSR) {
    // This is a placeholder that will return the URQL state during SSR.
    // See how JSON.stringify works:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#description
    initialState.urqlState = { toJSON: () => ssrCache.extractData() }
  } else {
    ssrCache.restoreData(initialState.urqlState)
  }

  app.use(urql, {
    url: '/graphql', // My GraphQL URL
    exchanges: [dedupExchange, cacheExchange, ssrCache, fetchExchange],
  })
})
```

## Vue Query

A simple in-component data fetcher tool such as [Vue Query](https://vue-query.vercel.app/) can be integrated as follows:

```js
// main.js
import vitedge from 'vitedge'
import App from './App.vue'
import routes from './routes'
import { QueryClient, hydrate, dehydrate, VUE_QUERY_CLIENT } from 'vue-query'

export default vitedge(App, { routes }, ({ app, initialState }) => {
  // Create a new VueQuery client inside the main hook (once per request)
  const client = new QueryClient()

  // Mount and provide the client to the app components
  client.mount()
  app.provide(VUE_QUERY_CLIENT, client)

  // Sync initialState with the client cache:
  if (import.meta.env.SSR) {
    // This is a placeholder that will return the VueQuery state during SSR:
    initialState.vueQueryState = { toJSON: () => dehydrate(client) }
  } else {
    // Hydrate the client in browser with existing state:
    hydrate(client, initialState.vueQueryState)
  }
})
```

```html
<!-- AnyComponent.vue -->
<script setup>
  import { onServerPrefetch } from 'vue'
  import { useQuery } from 'vue-query'

  const { data, suspense } = useQuery('myQuery', () => {})
  onServerPrefetch(suspense)
</script>
```
