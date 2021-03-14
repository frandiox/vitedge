# Getting Started

## Requirements

Vitedge relies on native ES Modules. Therefore, during development, it is recommended using Node version `>=14`, but `12.x` should also work in production.

## Installation

For a complete **starter template** with i18n, file routing and layout system, see [Vitessedge Template](https://github.com/frandiox/vitessedge-template). Otherwise, create a new project from scratch following these steps:

### 1. Create a Vite app

Since Vitedge is just a [Vite app](https://vitejs.dev/guide/#scaffolding-your-first-vite-project), first of all you must create one:

```sh
# Using NPM
npm init @vitejs/app my-vue-app --template vue # or vue-ts

# Using Yarn
yarn create @vitejs/app my-vue-app --template vue # or vue-ts
```

**Currently, only Vue is supported in Vitedge. Other frameworks might come later. Open feature requests if you are interested.**

### 2. Install Vitedge

First, add the following to your `package.json`:

```json
"type": "module",
```

Then, add Vitedge package:

```sh
# Using NPM
npm i vitedge

# Using Yarn
yarn add vitedge
```

### 3. Import Vitedge plugin

Import `vitedge/plugin.js` in your `vite.config.js`:

```js
import vitedgePlugin from 'vitedge/plugin.js'

export default {
  plugins: [vitedgePlugin()],
}
```

This will enable Vite to serve API and page props during development.

### 4. Use Vitedge in your entry point

Modify your entry point to call and export Vitedge like this:

```js
import './index.css'
import App from './App.vue'
import routes from './routes'
import vitedge from 'vitedge'

export default vitedge(
  App,
  { routes },
  ({ app, router, isClient, initialState }) => {
    // Custom setup hook.
    // E.g. set initialState in a Vuex store, install plugins, etc.
  }
)
```

Note that you don't need to create a router yourself. Vitedge will do this automatically after you provide the raw routes array.

### 5. Add backend functions

Create a `<root>/functions/` directory and populate [`<root>/functions/api/`](./api) and [`<root>/functions/props/`](./props) with your backend logic.

You can also add [environment files](./environment) in this directory.

### TypeScript (optional)

TypeScript is fully supported but needs some extra setup:

- Rename all your files (including `vite.config`) to have `*.ts` extension.
- Install `typescript` and `ts-node>=9.1` as `devDependencies`.

### Web Polyfills (optional)

Vitedge automatically polyfills some Web-only functionaly during development in Node.js, such as `fetch`, `btoa`, etc. If you need WebCrypto, simply install it as a dev-dependency and Vitedge will use it automatically.

For other polyfills, please open feature requests in the repo.
