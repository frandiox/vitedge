# Vitedge

[Vite](https://github.com/vitejs/vite) _Edge Side Rendering_ (ESR) framework for Vue and React.

> What's ESR? Think of SSR (Server Side Rendering) in CDN nodes instead of actual servers. This is possible today thanks to [Cloudflare Workers](https://workers.cloudflare.com/) (and maybe some other platforms in the near future).

Vitedge is **just a Vite app ™** that prerrenders the first view in an edge worker and runs the rest as an SPA. That means it will lead to good SEO while keeping the snappy routing and DX of an SPA.

It can replace static site generators in some situations since it builds on the fly and caches at the edge. Therefore, instead of getting a static `index.html` from the CDN, the CDN itself will create it on the fly or provide it from cache if it was already accessed (with configurable cache age + stale-while-revalidate).

Even though running it at the edge is ideal, it is actually compatible with any Node environment such as Vercel or Netlify.

See [live demo](https://vitessedge.zable.workers.dev/) and [Vue starter template](https://github.com/frandiox/vitessedge-template).

## Features

- ⚡ Ultrafast development and HMR powered by Vite and ES Modules.
- ⚔️ Renders and caches at the edge for maximum performance in production. Cache is configurable.
- 💁‍♂️ Each page gets its server data as props by default but can be set in a store instead.
- 🔽 HTTP/2 server push for your assets to speed up the loading time without waterfall requests.
- 🧱 Automatically creates endpoints for your API based on filesystem routes.

## Docs

See [docs](https://vitedge.netlify.app).

## Starters

- Vue, TS, i18n - [Code](https://github.com/frandiox/vitessedge-template) | [Demo](https://vitessedge.zable.workers.dev/)

## Roadmap

- [x] Support TypeScript projects.
- [x] Custom Vite dev-server that serves API/Props during development.
- [x] Docs website.
- [x] Extract CF worker boilerplate as utilities.
- [x] Cache props/html in worker and make it configurable.
- [x] i18n compatible.
- [x] Starter template.
- [ ] Auth utilities/guide (passing JWT in requests as cookies).
- [x] Compatibility with Node runtime for other providers (Vercel/Netlify...).
- [ ] Add example using Vercel's edge cache.
- [x] Detect imported files in HTML and push them with HTTP/2.
- [x] Add an SSR mode for local development (web worker?).
- [x] Support GraphQL, sitemap and other dynamic endpoints.
- [x] React compatibility.
- [ ] Provide React starter template.
- [ ] Svelte compatibility.
- [x] Support Vite 2.
- [x] HMR for API side.
- [x] Page props HMR in browser on file save.
- [x] Preload assets using Vite's manifest.
- [x] Support self-requests to API endpoints during SSR.
- [ ] Support parameters and wildcards in API file routes (`api/path/[param].js`).
- [ ] Stale-while-revalidate cache for pages.
- [ ] CORS defaults.
- [ ] Throw errors from API/Props endpoints.

## Contributing

See [contributing guide](./.github/contributing.md).
