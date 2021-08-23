# Getting Started

## Requirements

- Vitedge relies on **native ES Modules**. Therefore, during development, it is recommended using Node version `>=14`. However, `12.x` should also work in production.
- Currently, Vitedge supports **Vue** and **React** out of the box. For other frameworks, please open feature requests.
- A Vitedge app can be deployed to **any Node.js environment** (monolith or serverless) or to **Cloudflare Workers**. For the latter, you must open an account at [Cloudflare](https://www.cloudflare.com/).

## Installation

For a complete **starter template** with i18n, file routing and more, see [Vitesse for Vue](https://github.com/frandiox/vitessedge-template) or [Reactesse for React](https://github.com/frandiox/reactesse-edge-template). Otherwise, create a new project from scratch following these steps:

### 1. Create a Vite app

Since Vitedge is just a [Vite app](https://vitejs.dev/guide/#scaffolding-your-first-vite-project), first of all you must create one:

```bash
# Using NPM
npm init @vitejs/app my-vue-app --template [vue|vue-ts|react|react-ts]

# Using Yarn
yarn create @vitejs/app my-vue-app --template [vue|vue-ts|react|react-ts]
```

### 2. Install Vitedge and framework dependencies

First, add the following to your `package.json`:

```json
"type": "module",
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
- **React**: `react@17` `react-dom@17` `react-router-dom@5` `react-router-config@5` `react-helmet-async@1`

### 3. Import Vitedge plugin

Import `vitedge/plugin.js` in your `vite.config.js`:

```js
import vitedgePlugin from 'vitedge/plugin.js'
import vue from '@vitejs/plugin-vue'
// import reactRefresh from '@vitejs/plugin-react-refresh'

export default {
  plugins: [vitedgePlugin(), vue() /* reactRefresh() */],
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

### TypeScript (optional)

TypeScript is fully supported but needs some extra setup:

- Rename all your files (including `vite.config`) to have `*.ts` extension.
- Install `typescript` and `ts-node>=9.1` as `devDependencies`.

### Web and Worker Polyfills (optional)

Vitedge automatically polyfills some Web-only functionaly during development in Node.js, such as `fetch`, `btoa`, etc. If you need WebCrypto for anything related to JWT verification or Crypto in general, simply install [`node-webcrypto-ossl`](https://www.npmjs.com/package/node-webcrypto-ossl) as `devDependencies` and Vitedge will use it automatically during development.

For CFWorker-only APIs such as Key-Value store (Workers KV), edge cache or WebSocketPair, you will need to add `miniflare@^1.3.3` as a dev-dependency. Vitedge will use it to polyfill these APIs during development.

For other polyfills, please open feature requests in the repo.
