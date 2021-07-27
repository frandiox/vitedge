# Request Lifecycle

> Only available when deploying to Cloudflare Workers

Vitedge provides a set of lifecycle hooks that can be used to modify requests or add logs. Currently, these hooks are only available when deploying to Cloudflare Workers or in preview mode, not during development.

Hooks can be provided in the worker entry file when calling `handleEvent`:

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
