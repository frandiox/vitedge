# CORS

In situations where you want to consume your deployed resources from a different domain, you might find issues related to [Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

Vitedge exports utilities to handle CORS:

```js
import { handleEvent, cors } from 'vitedge/worker'

addEventListener('fetch', (event) => {
  event.respondWith(
    cors(
      handleEvent(event),
      // These are the default values so the whole object is optional.
      {
        origin: '*',
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        headers: ['*'],
        expose: '',
        maxage: '600',
        credentials: false,
      }
    )
  )
})
```

This will add CORS headers to every response. For more granular control, use the [lifecycle hooks](./handle-event#request-lifecycle):

```js
import { handleEvent, cors } from 'vitedge/worker'

addEventListener('fetch', (event) => {
  if (event.request.method === 'OPTIONS') {
    return event.respondWith(cors({ origin: '*' }))
  }

  event.respondWith(
    handleEvent(event, {
      didRequestApi({ response }) {
        return cors(response, { origin: '*' })
      },
    })
  )
})
```

The example above will only apply CORS to API requests and [preflight](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#preflighted_requests) requests. Rendering, static asset serving or page props requests won't include the CORS headers.
