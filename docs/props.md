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

The previous route will make a request to a props handler called `home` that should be provided in `<root>/functions/props/home.js` (or `*.ts`). If this file is not found, the request will be automatically skipped.
The name for the handler can also be modified by providing `meta.propsGetter` property in the route:

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

This will ignore the route's name and use `<root>/functions/props/something-else.js` as a handler instead (if it exists).

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
      headers: {}, // Optional dynamic headers
      status: 200, // Optional status, default 200
    }
  },
  options: {
    cache: {
      api: 90, // Cache's max-age for the "get page props" request
      html: 90, // Cache's max-age for the actual rendered HTML
    },
    headers: {
      // static headers
    },
  },
}
```

The actual handler gets the `event` ([FetchEvent](https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent)) and `request` ([fetch Request](https://developer.mozilla.org/en-US/docs/Web/API/Request)) objects provided by the running platform. Apart from that, the rest of the parameters match [Vue Router's counter parts](https://next.router.vuejs.org/api/#routelocationnormalized) for `params`, `query`, `hash`, `name` and `fullPath`.

The response must be an object with `data` property and will be served as JSON. Apart from `data`, it can also accept `headers` object, `status` number and `statusText` string.

**Note on headers**: Use always lower case for header keys.

### Redirects

A page can be redirected by returning a 3xx status code and the `location` header in its props handler:

```js
handler() {
  return {
    status: 302, // Any 3xx is accepted for a redirect
    headers: {
      location: '/another-page',
    },
  }
}
```

The browser will detect this status code and redirect to the specified header route.

### Errors

Any error thrown in the handler will translate to a JSON payload containing the information of this error and will be passed to the corresponding page component:

```js
{
  error: {
    status: 500,
    message: 'yikes',
    details: { /* ... */ },
    stack: 'Available only during development' }
}
```

Therefore, the page component will receive a `error` prop containing the payload. You can then redirect to another page or show it in the UI.

#### Built-in errors

Vitedge provides a handy group of built-in errors that represent different status codes. Check the import types for more.

```js
import {
  BadRequestError,
  ForbiddenError,
  UnknownError,
} from 'vitedge/errors.js'

// ...

throw new UnknownError('Our cloud monkeys are working to fix this', {
  fatal: true,
})
```

You can also extend the errors to create your own:

```js
import { RestError } from 'vitedge/errors.js'

export class ImATeapotError extends RestError {
  constructor(message, details) {
    super(message, 418, details)
  }
}

throw new ImATeapotError('Yolo')
```

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

It is also possible to get data in your page components by directly calling your API instead. In order to do this in Vue, you can rely on Suspense to await for the data:

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

In React, the `Suspense` component is already provided by Vitedge so you can just throw promises from any component.
