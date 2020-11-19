# Vitedge

[Vite](https://github.com/vitejs/vite) _Edge Side Rendering_ (ESR) framework.

> What's ESR? Think of SSR (Server Side Rendering) in CDN nodes instead of actual servers. This is possible today thanks to [Cloudflare Workers](https://workers.cloudflare.com/) (and maybe some other platforms in the near future).

See a demo [here](https://vitedge.zable.workers.dev/). Full code example [here](./example).

**Current status:** Dev, build and edge caching work. Needs typings and improving Commonjs <> ESM compatibility.

## Concept

Vitedge is "just a Vite app" that prerrenders the first view in a CF worker and runs the rest as an SPA. That means it will lead to good SEO while keeping the snappy routing and DX of an SPA.

It can replace static site generators in some situations since it builds on the fly and caches at the edge. Therefore, instead of getting a static `index.html` from the CDN, the CDN itself will create it on the fly or provide it from cache if it was already accessed (with configurable cache age + stale-while-revalidate).

Apart from the normal Vite app, it provides some extra fullstack utilities.

### API

It can create a REST API based on filesystem routes: `<root>/functions/api/my/function.js` will be built as `/api/my/function` endpoint and can be requested from the frontend.

### ESR Page Props

Each page can make an optional "get page props" request to the worker before rendering. For example, if a page's route is `/admin/customers/123`, the endpoint `/props/admin/customers/123` will be requested automatically before rendering. The handler for this route must be defined in `<root>/functions/props/<route name>`. The result of this call will be provided as props to the page component but it can also be passed to Vuex if needed.

## Requirements

For deploying to Cloudflare, you will need an account with the [Workers Bundled plan](https://workers.cloudflare.com/sites#plans) (\$5/mo) -- _No, I'm not affiliated with Cloudflare_.

Other providers (Netlify, Vercel, etc.) offer free tier generally.

## Usage

1. Create a normal Vite app.
2. Install `vitedge` with your package manager.
3. Import `vitedge/plugin.js` in your `vite.config.js`. [Example here](./example/vite.config.js).
4. Import and call Vitedge from your app's entry point providing your main `App.vue` and your page routes. Vitedge will create the router and attach the app to the DOM for you according to the running environment. [Example here](./example/src/main.js).
5. Add page props or API handlers in [functions directory](./example/functions).
6. Develop locally with Vite's blazing fast HMR running `vite --open`.
7. Build using `vitedge build` command, import `vitedge/worker` in your [worker entry point](./example/worker-site/index.js) and add a custom [Webpack config](./example/worker-site/webpack.config.js).

## TODOS - Raw ideas

- [ ] TypeScript
- [x] Custom Vite dev-server that serves API/Props during development
- [ ] Docs website
- [x] Extract CF worker boilerplate as utilities
- [x] Cache props/html in worker and make it configurable
- [ ] i18n utilities
- [ ] Auth utilities (passing JWT in requests)
- [ ] List of pages that should be prerrendered automatically after deployment
- [x] Compatibility with Node runtime for other providers (Vercel/...)
- [ ] Detect imported files in HTML and push them with HTTP2
- [ ] Sitemap utility (handler in `<root>/functions/sitemap.js`?)
- [ ] React/Preact compatibility.

### Research/consider

- Research if Rollup can build directly for webworker target and remove Webpack
- Explore the possibility of extracting "getPageProps" from each page component using custom Vue blocks (currently these are provided in `<root>/api/props/` directory).
- Consider file sytem routing for pages (this should probably happen in user-land with `vite-plugin-voie` or similar)
