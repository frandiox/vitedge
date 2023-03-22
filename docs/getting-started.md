# Getting Started

Vitedge is a [Vite](https://vitejs.dev) _Edge Side Rendering_ (ESR) framework. It supports Vue and React out of the box but can work with any view library (or Vanilla JS).

::: tip What is ESR?
Think of SSR (Server Side Rendering) in CDN nodes instead of actual servers. This is possible today thanks to [**Cloudflare Workers**](https://workers.cloudflare.com/), and maybe some other platforms in the near future.
:::

Vitedge is **just a Vite app ™** that prerenders the first view in an edge worker and runs the rest as an SPA. That means it will lead to **good SEO** while keeping the **snappy routing** and **DX of an SPA**.

It can replace static site generators in some situations since it builds on the fly and caches at the edge. Therefore, instead of getting a static `index.html` from the CDN, the CDN itself will create it on the fly or provide it from cache if it was already accessed (with configurable cache age + stale-while-revalidate).

Even though running it at the edge is ideal, it is actually **compatible with any Node environment** such as **Vercel** or **Netlify**.

::: tip Get in touch
Join [ViteLand Discord](https://discord.gg/taRZdpzHhR) and check `#vitedge` channel or use [GitHub's Discussions](https://github.com/frandiox/vitedge/discussions).
:::

## Requirements

- Vitedge relies on **native ES Modules**. Therefore, during development, it is recommended using Node version `>=14`. However, `12.x` should also work in production.
- Currently, Vitedge supports **Vue** and **React** out of the box but it also exposes utilities for Vanilla JS or [bring-your-own-framework](./custom-rendering).
- A Vitedge app can be deployed to **any Node.js environment** (monolith or serverless) or to **Cloudflare Workers**. For the latter, you must open an account at [Cloudflare](https://www.cloudflare.com/).

## Installation

For a complete **starter template** with i18n, file routing and more, see [Vitesse for Vue](https://github.com/frandiox/vitessedge-template) or [Reactesse for React](https://github.com/frandiox/reactesse-edge-template). Otherwise, create a new project from scratch following these steps:

### 1. Create a Vite app

Since Vitedge is just a [Vite app](https://vitejs.dev/guide/#scaffolding-your-first-vite-project), first of all you must create one:

```bash
# Using NPM
npm init vite my-vue-app --template [vue|vue-ts|react|react-ts]

# Using Yarn
yarn create vite my-vue-app --template [vue|vue-ts|react|react-ts]
```

### 2. Install Vitedge and framework dependencies

First, add the following to your `package.json`:

```json
"type": "module",
```

Make sure your `index.html` contains a root element with id `app`:

```html
<div id="app"></div>
```

Then, add Vitedge package:

```bash
# Using NPM
npm i vitedge

# Using Yarn
yarn add vitedge
```

Apart from that, install your framework dependencies if the starting template didn't add them:

- **Vue**: `vue@3` `@vue/server-renderer@3` `vue-router@4` `@vueuse/head`
- **React**: `react@17` `react-dom@17` `react-router-dom@6` `react-helmet-async@1`

### 3. Import Vitedge plugin

Import `vitedge/plugin.js` in your `vite.config.js`:

```js
import vitedgePlugin from 'vitedge/plugin.js'
import vue from '@vitejs/plugin-vue'
// import react from '@vitejs/plugin-react'

export default {
  plugins: [vitedgePlugin(), vue() /* react() */],
}
```

This will enable Vite to serve API and page props during development.

### 4. Use Vitedge in your entry point

Modify your entry point to call and export Vitedge like this:

```js
import './index.css'
import App from './App.vue' // App.jsx
import routes from './routes'
import vitedge from 'vitedge'

export default vitedge(
  App,
  { routes },
  ({ app, router, isClient, initialState }) => {
    // Custom setup hook.
    // E.g. set initialState in a store, install plugins, etc.
  }
)
```

The third argument is Vitedge's main hook, which runs only once at the start. It receives the [SSR Context](./ssr-context) and can be used to initialize the app or setup anything like state management or other plugins.

In React, the same SSR Context is passed to the main App function/component as props. You must rely on the routes provided in `router.routes` instead of the raw `routes` array when using React Router:

```jsx
import { Switch, Route } from 'react-router-dom'

export default function App({ router }) {
  return (
    <Switch>
      {router.routes.map((route) => (
        <Route exact={route.exact} path={route.path} key={route.path}>
          <route.component />
        </Route>
      ))}
    </Switch>
  )
}
```

### 5. Add backend functions

Create a `<root>/functions/` directory and populate `<root>/functions/api/` with [API endpoints](./api) and `<root>/functions/props/` with [Page Props](./props).

You can also add [environment files](./environment) in this directory.

### 6. Replace NPM scripts to use Vitedge CLI

Vitedge CLI is a simple wrapper around Vite that conveniently adds some experimental Node flags (e.g. JSON imports) to your command and detects TS projects automatically.

Therefore, you must replace your scripts in `package.json` to run `vitedge` instead.

```json
{
  "scripts": {
    "dev": "vitedge --ssr",
    "dev:spa": "vitedge",
    "preview": "vitedge preview",
    "preview:watch": "vitedge preview --build-watch",
    "build": "rm -rf dist && vitedge build"
  }
}
```

See [Usage](./usage) for more information.

### TypeScript (optional)

TypeScript is fully supported but needs some extra setup:

- Rename all your files (including `vite.config`) to have `*.ts` extension.
- Install `typescript` and `ts-node>=10.4` as `devDependencies`.

### Web and Worker Polyfills (optional)

Vitedge automatically polyfills some Web-only functionaly during development in Node.js, such as `fetch`, `btoa`, etc. If you need WebCrypto for anything related to JWT verification or Crypto in general, simply install [`node-webcrypto-ossl`](https://www.npmjs.com/package/node-webcrypto-ossl) as `devDependencies` and Vitedge will use it automatically during development.

For CFWorker-only APIs such as Key-Value store (Workers KV), edge cache or WebSocketPair, you will need to add `miniflare@^1.3.3` as a dev-dependency. Vitedge will use it to polyfill these APIs during development.

For other polyfills, please open feature requests in the repo.
