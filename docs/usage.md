# Usage

Once Vitedge is installed, you can use its CLI for develoing and building. See a full example project [here](https://github.com/frandiox/vitedge/tree/master/example).

## Development

Run `vitedge dev` to start a local Vite server that serves API and page props.

Note that this is all running in your browser without doing SSR.

You can pass any Vite's CLI option to this command. E.g. `vitedge dev --open --port 1337`.

## Build

Once the app is ready, run `vitedge build` to create 3 different builds:

- SPA build in `dist/client`.
- SSR build in `dist/ssr`
- API build in `dist/functions`

### Cloudflare worker

Import Vitedge's webpack configuration in your worker's webpack config file:

```js
module.exports = {
  // Add your own config here if you need
  ...require('vitedge/webpack.cjs'),
}
```

Then, simply import `handleEvent` in your worker entry point:

```js
import { handleEvent } from 'vitedge/worker'

addEventListener('fetch', (event) => {
  event.respondWith(handleEvent(event))
})
```

See a full example [here](https://github.com/frandiox/vitedge/tree/master/example/worker-site/index.js).

### Other Node environments

For a normal Node.js server or any serverless function running in a Node.js environment, you can find a full example [here](https://github.com/frandiox/vitedge/tree/master/example/node-site/index.js).
