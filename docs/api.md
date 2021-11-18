# API

Vitedge can optionally create API endpoints. The advantage of this is having frontend and backend running in the same domain to prevent cross-origin issues and preflight requests.

## Rest

### Routes

Every file in `<root>/functions/api` will be accessible from th API.

For example, `<root>/functions/api/my/function.js` (or `*.ts`) will be built as `/api/my/function` endpoint and can be requested from the frontend.

#### Versioning

The API can be organized in subfolders such as `<root>/functions/api/v1/*` to provide API versioning.

#### Dynamic routes

Dynamic routes (e.g. `/api/users/:id`) can be specified by using brackets in file or directory names as follows:

- **Required parameter**: Single brackets `<root>/functions/api/users/[id].js`. This will match `/api/users/xxx` and provide `{ params: { id: 'xxx' } }` to the handler.
- **Optional parameter**: Double brackets `<root>/functions/api/users/[[id]].js`. This will match the previous example in the same way, but also `/api/users` and provide `{ params: undefined }` to the handler.
- **Catch all**: Brackets with `...` prefix `<root>/functions/api/users/[...all].js`. This will match `/api/users/deep/value` and provide `{ params: { all: 'deep/value' } }` to the handler. Note that this won't match a missing parameter (`/api/users`).

Directories can also follow the same naming convention to have more than 1 parameter: `<root>/functions/api/[:directory]/[:file].js` turns into `{ params: { directory: '...', file: '...' } }`.

### Handlers

Each handler file looks like this:

```js
export default {
  async handler({ event, request, params }) {
    if (request.method !== 'GET') {
      throw new Error('Method not supported!')
    }

    // Optional:
    // return new Response('...', { headers: { ... } })

    return {
      // This will be treated as JSON
      data: { msg: 'Hello world!' },
      headers: {} // Optional dynamic headers
      status: 200 // Optional status (200 is default)
      cache: {} // Optional dynamic cache
    }
  },
  options: {
    cache: {
      api: 85, // Cache's max-age in seconds
    },
    // Static optional headers
    headers: {
      'content-type': 'application/json', // This is default
    },
  },
}
```

The actual handler gets the `event` ([FetchEvent](https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent)) and `request` ([fetch Request](https://developer.mozilla.org/en-US/docs/Web/API/Request)) objects provided by the running platform. Note that some properties of these objects might be missing during development (such as CF's location information).

The response must be either a new [fetch Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) or an object with `data` property that contains a stringifiable object or plan text.

**Note on headers**: Use always lower case for header keys.

### Errors

Any error thrown in the handler will translate to a JSON payload containing the information of this error:

```js
{
  error: {
    status: 500,
    message: 'yikes',
    details: { /* ... */ },
    stack: 'Available only during development'
  }
}
```

#### Built-in errors

Vitedge provides a handy group of built-in errors that represent different status codes. Check the import types for more.

```js
import {
  MethodNotAllowedError,
  ForbiddenError,
  UnknownError,
} from 'vitedge/errors.js'

// ...

throw new MethodNotAllowedError('Only GET is allowed', {
  /* details */
})
```

You can also extend the errors to create your own:

```js
import { RestError } from 'vitedge/errors'

export class ImATeapotError extends RestError {
  constructor(message, details) {
    super(message, 418, details)
  }
}

throw new ImATeapotError('Yolo')
```

#### Types

In order to get type validation and autocompletion, do one of the following:

```ts
// Only TypeScript
import { ApiEndpoint } from 'vitedge'

export default <ApiEndpoint>{
  // handler, options, ...
} // as ApiEndpoint // <- This is equivalent
```

```js
// JavaScript or TypeScript
import { defineApiEndpoint } from 'vitedge/define'

export default defineApiEndpoint({
  // handler, options, ...
})
```

## Consuming the API

You can freely call your API from the frontend. In order to make the API available in from other domains, [configure CORS](https://developers.cloudflare.com/workers/examples/cors-header-proxy) in the worker/node entry point.

Generally, it is not possible to make self-requests when running on CF Workers (e.g. calling your own API during SSR, from worker to worker). However, Vitedge will automatically redirect these API requests to local function calls during SSR. Simply make sure you use `fetch` or any library that uses it internally.

```js
export default {
  name: 'MyPage',
  async setup() {
    // In Browser rendering, this behaves as a normal fetch.
    // In SSR, it directly calls the corresponding API handler.
    const response = await fetch('/api/hello/world')
    const data = await response.json()

    return { data }
  },
}
```

## Other endpoints

Apart from `<root>/functions/api/**/*` directory, Vitedge will consider any file directly under `<root>/functions/*` to be similar to an API endpoint (following similar syntax in the handlers and cache options).

Thanks to this, it can support other use cases such as the following.

### GraphQL

Add `<root>/functions/graphql.js` and setup a GraphQL server using [`apollo-server-cloudflare`](https://www.npmjs.com/package/apollo-server-cloudflare) or any other tool compatible with your deployment platform.

### Dynamic sitemap, robots, and other files

Add `<root>/functions/sitemap.js` or `<root>/functions/robots.js` and return the corresponding content with cache options. See example [here](https://github.com/frandiox/vitedge/blob/master/examples/vue/functions/sitemap.ts). Both `/sitemap.xml` and `sitemap.txt` will match and run the handler (check the request's URL if you want to return different values for each extension).

Note that static files have higher priority than dynamic files. For example, if you have both `<root>/public/sitemap.xml` and `<root>/functions/sitemap.js`, the former will be served.
