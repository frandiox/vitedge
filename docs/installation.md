# Installation

## 1. Create a Vite app

Since Vitedge is just a Vite app, first of all you must create one:

```sh
# Using NPM
npm init vite-app my-vitedge-project --template vue

# Using Yarn
yarn create vite-app my-vitedge-project --template vue
```

**Currently, only Vue is supported in Vitedge. Other frameworks might come later.**

## 2. Install Vitedge

First, add the following to your `package.json`:

```json
"type": "module",
"scripts": { "postinstall": "vitedge patch" }
```

This will patch some issues in Vite itself related to ES Modules.

Then, add Vitedge package:

```sh
# Using NPM
npm i vitedge

# Using Yarn
yarn add vitedge
```

## 3. Import Vitedge plugin

Import `vitedge/plugin.cjs` in your `vite.config.js`:

```js
import vitedgePlugin from 'vitedge/plugin.cjs'

export default {
  plugins: [vitedgePlugin],
}
```

This will enable Vite to serve API and server props during development.

## 4. Use Vitedge in your entry point

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
