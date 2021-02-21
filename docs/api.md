# API

Vitedge can optionally create API endpoints. The advantge of this is having frontend and backend running in the same domain to prevent cross-origin issues and preflight requests.

## Rest

### Routes

Every file in `<root>/functions/api` will be accessible from th API.

For example, `<root>/functions/api/my/function.js` (or `*.ts`) will be built as `/api/my/function` endpoint and can be requested from the frontend.

Parameters in routes (e.g. `/api/my/function/:something`) are not supported right now and must be handled manually.

#### Versioning

The API can be organized in subfolders such as `<root>/functions/api/v1/*` to provide API versioning.

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

**Note on headers**: Use always lower case for header keys.

### Types

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

## Other endpoints

Apart from `<root>/functions/api/**/*` directory, Vitedge will consider any file directly under `<root>/functions/*` to be similar to an API endpoint (following similar syntax in the handlers and cache options).

Thanks to this, it can support other use cases such as the following.

### GraphQL

Add `<root>/functions/graphql.js` and setup a GraphQL server using [`apollo-server-cloudflare`](https://www.npmjs.com/package/apollo-server-cloudflare) or any other tool compatible with your deployment platform.

### Dynamic sitemap, robots, and other files

Add `<root>/functions/sitemap.js` or `<root>/functions/robots.js` and return the corresponding content with cache options. See example [here](https://github.com/frandiox/vitedge/blob/master/examples/vue/functions/sitemap.ts). Both `/sitemap.xml` and `sitemap.txt` will match and run the handler (check the request's URL if you want to return different values for each extension).

Note that static files have higher priority than dynamic files. For example, if you have both `<root>/public/sitemap.xml` and `<root>/functions/sitemap.js`, the former will be served.
