# API

Vitedge can optionally create API endpoints. The advantge of this is having frontend and backend running in the same domain to prevent cross-origin issues and preflight requests.

## Rest

### Routes

Every file in `<root>/functions/api` will be accessible from th API.

For example, `<root>/functions/api/my/function.js` (or `*.ts`) will be built as `/api/my/function` endpoint and can be requested from the frontend.

Parameters in routes (e.g. `/api/my/function/:something`) are not supported right now and must be handled manually.

### Handlers

Each handler file looks like this:

```js
export default {
  async handler({ event, request }) {
    if (request.method !== 'GET') {
      throw new Error('Method not supported!')
    }

    return {
      data: {
        msg: 'Hello world!',
      },
    }
  },
  options: {
    cache: {
      api: 85, // Cache's max-age in seconds
    },
    headers: {
      'content-type': 'application/json', // This is default
    },
  },
}
```

The actual handler gets the `event` and `request` objects provided by the running platform.
The response must be an object with `data` property.

## GraphQL

TODO (Should be straightforward using Apollo Server or similar)
