# Vitedge

Vite SSR framework for Cloudflare Workers.

See a full example [here](./example).

## Concept

Vitedge is "just a Vite app" that prerrenders the first view in a CF worker and runs the rest as an SPA. That means it will lead to good SEO while keeping the snappy routing and DX of an SPA.

It replaces static site generators since it builds on the fly and caches at the edge (cache is WIP). Therefore, instead of getting a static `index.html` from the CDN, the CDN itself will create it on the fly or provide it from cache if it was alredy accessed (with configurable cache age).

Apart from the normal Vite app, it provides some extra fullstack utilities.

### API

It can create a REST API based on filesystem routes: `<root>/api/my/function.js` will be built as `/api/my/function` endpoint and can be requested from the frontend.

### SSR Page Props

Each page can make an optional "get page props" request to the worker before rendering. For example, if a page's route has `name: "customers"`, the endpoint `/api/props/customers` will be called automatically before rendering. The handler for this route must be defined in `<root>/api/props/customers.js`.

## Usage

1. Create a normal Vite app.
2. Install `vitedge` with your package manager.
3. Import `vitedge/plugin` in your `vite.config.js`. [Example here](./example/vite.config.js).
4. Import and call Vitedge from your app's entry point providing your main `App.vue` and your page routes. Vitedge will create the router and attach the app to the DOM for you according to the running environment. [Example here](./example/src/main.js)
5. Build using `vitedge build` command

## TODOS

- Custom Vite dev-server that serves API during development
- Provide TS types
- Docs website
- File sytem routing for pages
- Extract CF worker boilerplate as a utility
- Cache props/html in worker's KV and make it configurable
- List of pages that should be prerrendered automatically after deployment
- Research if Rollup can build directly for webworker target and remove Webpack
- i18n utilities
- Explore the possibility of extracting "getPageProps" from each page component using custom Vue blocks (currently these are provided in `<root>/api/props/` directory).
