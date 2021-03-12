# Edge Page Props

When a page is rendered it normally requires getting data from the server that cannot be provided in the frontend. This is normally done via a "get page props" call to the API. The API would return data that is later used to render the page.

## Props getter locations

In Vitedge, each page can make an optional "get page props" request right before rendering. The props handlers are located in `<root>/functions/props/...` directory. Each page is connected to its props handler via its route name:

```js
export default const routes [
  {
    path: '/',
    name: 'home',
    component: () => import('@pages/home.vue'),
    meta: {
      // ...
    },
  },
]
```

The previous route will make a request to a props handler called `home` that must be provided in `<root>/functions/props/home.js` (or `*.ts`). This can be modified by providing `meta.propsGetter` property in the route:

```js
export default const routes [
  {
    path: '/',
    name: 'home',
    component: () => import('@pages/home.vue'),
    meta: {
      propsGetter: 'something-else'
    },
  },
]
```

This will ignore the route's name and use `<root>/functions/props/something-else.js` as a handler instead.

### Disabling page props request for a route

If a specific page does not need any props at all, it can be disabled with `meta.propsGetter: false`.

## Handlers

Each handler file looks like this:

```js
export default {
  handler({ event, request, params = {}, query = {} }) {
    return {
      data: {
        server: true,
        msg: 'This is an EXAMPLE page ',
      },
    }
  },
  options: {
    cache: {
      api: 90, // Cache's max-age for the "get page props" request
      html: 90, // Cache's max-age for the actual rendered HTML
    },
  },
}
```

The actual handler gets the `event` and `request` objects provided by the running platform. Apart from that, the rest of the parameters match [Vue Router's counter parts](https://next.router.vuejs.org/api/#routelocationnormalized) for `params`, `query`, `hash`, `name` and `fullPath`.

The response must be an object with `data` property and will be served as JSON.

**Note on headers**: Use always lower case for header keys.

### Types

In order to get type validation and autocompletion, do one of the following:

```ts
// Only TypeScript
import { EdgeProps } from 'vitedge'

export default <EdgeProps>{
  // handler, options, ...
} // as EdgeProps // <- This is equivalent
```

```js
// JavaScript or TypeScript
import { defineEdgeProps } from 'vitedge/define'

export default defineEdgeProps({
  // handler, options, ...
})
```

## Using props

Vitedge will pass the result of this request to your page component as props.

```js
export default {
  name: 'MyPage',
  props: {
    server: Boolean,
    msg: String,
  },
  // ...
}
```

Alternatively, you can disable passing props to components globally from the main entry point if you prefer relying on stores:

```js
export default vitedge(
  App,
  { routes, pageProps: { passToPage: false } }, // Disable page component props
  ({ app, router, initialState }) => {
    // You can pass it to your state management (Vuex/Pinia/etc)
    const store = createStore(initialState)
    app.use(store)

    router.beforeEach((to) => {
      // Page props requests are available
      // in each route's meta.state
      store.update(to.meta.state)
    })
  }
)
```

## Alternatives to page props

It is also possible to get data in your page components by directly calling your API instead. In order to do this, you can rely on Suspense to await for the data:

```html
<template>
  <RouterView v-slot="{ Component }">
    <Suspense>
      <component :is="Component" />
    </Suspense>
  </RouterView>
</template>
```

```js
export default {
  name: 'MyPage',
  // This will be awaited by Suspense in both browser and SSR
  async setup() {
    // In Browser rendering, this behaves as a normal fetch.
    // In SSR, it directly calls the corresponding API handler.
    const response = await fetch('/api/hello/world')
    const data = await response.json()

    return { data }
  },
}
```
