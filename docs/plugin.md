# Plugin Options

The plugin added to `vite.config.js` accepts some options to let you configure Rollup or ESBuild behavior. TypeScript should be available in the plugin to help you autocomplete the options.

## Client build

Pass any [Vite config options](https://vitejs.dev/config/) to the plugin in `options.client` property.

## SSR build

Pass any [Vite config options](https://vitejs.dev/config/) to the plugin in `options.ssr` property.

## Backend functions build

The backend functions are built using Vite but only a subset of the options applies. From the  [Vite config options](https://vitejs.dev/config/), any of the following are available in the `options.functions` property: `build.rollupOptions`, `build.commonjsOptions`, `build.minify`, `build.target`, `build.terserOptions`, `esbuild`, `define`, `json`, `plugins`, `resolve`.

## Worker script build

If you choose to build the worker script [using ESBuild](./usage#esbuild) instead of Webpack, options can be passed to the plugin in the `options.worker` property.

Most of the [ESBuild options](https://esbuild.github.io/api/#simple-options) are available, except some that would affect internal behavior.

## Exclude components from SSR build

`options.excludeSsrComponents: Regex[]`: any component file that matches this option will be excluded from the SSR build. This can be useful for leaving out non-isomorphic components that crash during SSR, or to simply make the bundle smaller for CFW constraints.

**Note**: this works by mocking the default export of each component. Named exports won't be mocked and might break your app if you use them.
