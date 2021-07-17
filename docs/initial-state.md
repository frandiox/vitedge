# SSR Initial State

The SSR initial state is the application data that is serialized as part of the server-rendered HTML for later hydration in the browser. This data is normally gathered using fetch or DB requests from your API code.

::: tip
Chances are that you don't need to manipulate the state object directly if you stick to [Page Props](./props) for data fetching. Regardless, it's useful to know how things work under the hood.
:::

Vitedge's initial state consists of a plain JS object that is passed to your application and can be modified at will during SSR. This object will be serialized and later hydrated automatically in the browser, and passed to your app again so you can use it as a data source.

```js
export default vitedge(App, { routes }, ({ initialState }) => {
  if (import.meta.env.SSR) {
    // Write in server
    initialState.myData = 'DB/API data'
  } else {
    // Read in browser
    console.log(initialState.myData) // => 'DB/API data'
  }

  // Provide the initial state to your stores, components, etc. as you prefer.
})
```

## State serialization

Vitedge simply uses `JSON.stringify` to serialize the state, **escapes certain characters to prevent XSS** and saves it in the DOM. This behavior can be overriden by using the `transformState` hook in case you need to support dates, regexp or function serialization:

```js
import vitedge from 'vitedge'
import App from './App'
import routes from './routes'

export default vitedge(App, {
  routes,
  transformState(state, defaultTransformer) {
    if (import.meta.env.SSR) {
      // Serialize during SSR by using.
      // E.g. using `devalue` library.
      return customSerialize(state)
    } else {
      // Deserialize in browser
      return customDeserialize(state)
    }
  },
})
```

The `defaultTransformer` is what Vitedge would normally apply if `transformState` hook isn't provided. This is useful to apply custom modifications to the state and then let Vitedge continue its normal flow. See [Apollo GraphQL integration](./integrations) for an example.

## Data fetching

Vitedge provides [Page Props](./props) functionality to fetch data before entering a route. **This is the simplest, recommended way to fetch data** and is compatible with every environment. This way, your lazy page components won't even need to be downloaded. It also **allows HMR during development**: making changes in a page props handler file will automatically update your page props component in the browser without a full page refresh.

However, in certain circumstances you might want to fetch data directly from within your components. Here are some ways you might want to consider:

### Vue

- Calling your API directly from Vue components using Suspense, and storing the result in the SSR initial state.

```js
// Use Suspense in your app root
<template>
  <RouterView v-slot="{ Component }">
    <Suspense>
      <component :is="Component" />
    </Suspense>
  </RouterView>
</template>
```

```js
// Component with Async Setup
export default {
  async setup() {
    const state = await (await fetch('/api/my-endpoint')).json()
    return { state }
  },
}
```

- Calling your API directly from Vue components using Vue's serverPrefetch, and storing the result in the SSR initial state. See [Pinia integration](./integrations#pinia) for an example installing stores.

```js
// Component with Server Prefetch
export default {
  beforeMount() {
    // In browser
    this.fetchMyData()
  },
  async serverPrefetch() {
    // During SSR
    await this.fetchMyData()
  },
  methods: {
    fetchMyData() {
      const store = useStore()
      if (!store.myData) {
        return fetch('/api/my-endpoint')
          .then((res) => res.json())
          .then((myData) => {
            store.myData = myData
          })
      }
    },
  },
}
```

### React

- Call your API and throw a promise in order to leverage React's Suspense (in both browser and server) anywhere in your components. Vitedge is already adding Suspense to the root so you don't need to provide it.

```js
function MyComponent({ initialState }) {
  if (!initialState.myData) {
    const promise = fetch('/api/my-endpoint')
      .then((res) => res.json())
      .then((state) => {
        initialState.myData = state
      })

    // Throw the promise so React Suspense can handle it
    throw promise
  }

  return <div>{initialState.myData}</div>
}
```
