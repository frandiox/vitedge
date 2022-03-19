# Handle Event Options

> Currently this is not available in development, only in production or preview modes

When running in [production or preview mode](./usage.md#production), Vitedge's `handleEvent` function accepts the following options.

## Request Lifecycle

> Only available when deploying to Cloudflare Workers

Vitedge provides a set of lifecycle hooks that can be used to modify requests or add logs.

```js
import { handleEvent } from 'vitedge/worker'

addEventListener('fetch', (event) => {
  try {
    event.respondWith(
      handleEvent(event, {
        willRequestApi({ url, query }) {
          console.log('API:', url.pathname, query)
        },
        didRequestRender({ response }) {
          if (response.status >= 300 && response.status < 400) {
            console.log('Page redirect:', response.headers.get('location'))
          }
        },
      })
    )
  } catch (error) {
    event.respondWith(
      new Response(error.message || error.toString(), {
        status: 500,
      })
    )
  }
})
```

This is the list of the available lifecycle hooks:

- `willRequestAsset`: Called before an asset is retrieved from KV. Receive `{ event }` in the arguments.
- `didRequestAsset`: Called after an asset is retrieved from KV. Receive `{ event response }` in the arguments. It can modify the response.
- `willRequestApi`: Called before an API handler runs. Receive `{ event, url, query }` in the arguments.
- `didRequestApi`: Called after an API handler returns. Receive `{ event, url, query, response }` in the arguments. It can modify the repsonse.
- `willRequestProps`: Called before a Page Props handler runs. Receive `{ event, url, query }` in the arguments.
- `didRequestProps`: Called after a Page Props handler returns. Receive `{ event, url, query, response }` in the arguments. It can modify the response.
- `willRequestRender`: Called before a page is rendered. Receive `{ event }` in the arguments.
- `didRequestRender`: Called after a page is rendered. Receive `{ event response }` in the arguments. It can modify the response.

## Skip SSR

The option `skipSSR: boolean` allows to skip the rendering for certain routes and simply return the naked `index.html` to fallback to a simple SPA. For example, the following would behave as an SPA for any route that includes `/admin/`.

```js
handleEvent(event, {
  skipSSR: event.request.url.includes('/admin/')
})
```

## Global Cache Option

If you have same caching policy for different pages it is possible to define default cache configuration globally as follows.

```js
handleEvent(event, {
  cache: { html:<number>, api: <number> }
})
```

Refer to [caching](./cache.md) section for moore details.

## HTTP2 Server Push

Thanks to [HTTP/2 Server Push](https://developers.google.com/web/fundamentals/performance/http2#server_push) it is possible to push certain assets to the browser in parallel to the current request to avoid waterfall requests. The `http2ServerPush: Array<'script' | 'style'>` option allows selecting which assets are pushed.

```js
handleEvent(event, {
  http2ServerPush: {
    destinations: ['style'],
  },
})
```

This will populate the `Link` header, which is then used by the browser to preload the assets.

**Note**: Behavior might differ depending on the browser.
