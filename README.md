# Vitedge

[Vite](https://github.com/vitejs/vite) _Edge Side Rendering_ (ESR) framework.

> What's ESR? Think of SSR (Server Side Rendering) in CDN nodes instead of actual servers. This is possible today thanks to [Cloudflare Workers](https://workers.cloudflare.com/) (and maybe some other platforms in the near future).

Vitedge is **just a Vite app ™** that prerrenders the first view in an edge worker and runs the rest as an SPA. That means it will lead to good SEO while keeping the snappy routing and DX of an SPA.

It can replace static site generators in some situations since it builds on the fly and caches at the edge. Therefore, instead of getting a static `index.html` from the CDN, the CDN itself will create it on the fly or provide it from cache if it was already accessed (with configurable cache age + stale-while-revalidate).

Even though running it at the edge is ideal, it is actually compatible with any Node environment.

See a demo [here](https://vitedge.zable.workers.dev/). Full code example [here](./example).

## Features

- Ultrafast development and HMR powered by Vite.
- Renders and caches at the edge for maximum performance in production. Cache is configurable.
- Each page gets its server data as props by default but can be set in Vuex instead.
- HTTP/2 server push four your assets to speed up the loading time without waterfall requests.
- Automatically creates endpoints for your API based on filesystem routes.

## Docs

See [docs][./docs]

## Roadmap

- [x] Support TypeScript projects
- [x] Custom Vite dev-server that serves API/Props during development
- [ ] Docs website
- [x] Extract CF worker boilerplate as utilities
- [x] Cache props/html in worker and make it configurable
- [ ] i18n utilities
- [ ] Auth utilities (passing JWT in requests)
- [ ] List of pages that should be prerrendered automatically after deployment
- [x] Compatibility with Node runtime for other providers (Vercel/Netlify...)
- [ ] Add example using Vercel's edge cache.
- [x] Detect imported files in HTML and push them with HTTP/2
- [ ] Add a "preview" mode that runs SSR for local development (web worker?)
- [ ] Sitemap utility (handler in `<root>/functions/sitemap.js`?)
- [ ] React/Preact compatibility.

### Contributing

See [contributing guide](./.github/contributing.md).
