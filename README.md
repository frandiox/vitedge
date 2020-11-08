# Vitedge

Vite SSR framework for Cloudflare Workers.

See a full [example here](./example)

## Concepts

Vitedge is "just a Vite app" that prerrenders the first view in a CF worker and runs the rest as an SPA. Apart from the normal Vite app, it provides some extra fullstack utilities.

### API

It can create a REST API based on filesystem routes: `<root>/api/my/function.js` will be built as `/api/my/function`.

### SSR Page Props

Each page can make an optional "get page props" request to the worker before rendering. For example, if a page's route has `name: "customers"`, the endpoint `/api/props/customers` will be called. The handler for this route must be defined in `<root>/api/props/customers.js`.

## TODOS

- Provide TS types
- Docs website
- File sytem routing for pages
- Extract CF worker boilerplate as a utility
- Cache props/html in worker's KV and make it configurable
- i18n utilities
- List of pages that should be prerrendered automatically after deployment
