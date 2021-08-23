# Plugin Options

The plugin added to `vite.config.js` accepts some options to let you configure Rollup or ESBuild behavior. TypeScript should be available in the plugin to help you autocomplete the options.

## Backend functions build

Backend functions are built using Vite. Therefore, its options are similar to those in the frontend.
Specifically, the following options are available in the `functions` property of the plugin:

- [build.rollupOptions](https://vitejs.dev/config/#build-rollupoptions)

- [build.commonjsOptions](https://vitejs.dev/config/#build-commonjsoptions)

- [build.minify](https://vitejs.dev/config/#build-minify)

- [build.target](https://vitejs.dev/config/#build-target)

- [build.terserOptions](https://vitejs.dev/config/#build-terseroptions)

- [esbuild](https://vitejs.dev/config/#esbuild)

- [define](https://vitejs.dev/config/#define)

- [json](https://vitejs.dev/config/#json-namedexports)

- [plugins](https://vitejs.dev/config/#plugins)

- [resolve](https://vitejs.dev/config/#resolve-alias)

## Worker script build

If you choose to build the worker script [using ESBuild](./usage#esbuild) instead of Webpack, options can be passed to the plugin in the `worker` property.

Most of the [ESBuild options](https://esbuild.github.io/api/#simple-options) are available, except some that would affect internal behavior.
