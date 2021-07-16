# Conditional Rendering

Vitedge features a single entry point to make SSR simpler. However, some times it's necessary to run code only in frontend or only in the backend. Here are different situations and how to solve them.

::: tip Note
The code in your `<root>/functions` directory runs only in the backend. Therefore, the following strategies only apply to the isomorphic code in `<root>/src`.
:::

## Tree-shakeable conditional code

For general code that needs to run only in 1 side, using Vite's `import.meta.env.SSR` will help to tree-shake this code when is not used:

```js
if (!import.meta.env.SSR) {
  // This piece here will only be
  // included in the browser bundle.

  window.anything
  myFunctionThatCallsWindow()
}
```

## Rendering a component only in the browser

For cases where a specific component can render only in the browser (e.g. because it tries to access the `window` or `document` objects on render), it can be wrapped using the `ClientOnly` component that Vitedge exports:

```js
import { ClientOnly } from 'vitedge'

...
<ClientOnly>
 <MyComponentThatCallsWindow />
</ClientOnly>
```

Note that this component is already registered globally in Vue apps so it can be used directly.

## Dependency crashes on import

If one of your dependencies calls `window` or any browser/server specific API on import (at the top level), it will likely crash your code when running in the wrong environment. This can be worked around in a few ways.

### Dynamic imports

The problematic dependencies can be imported conditionally using dynamic imports:

```js
let myDependency
if (!import.meta.env.SSR) {
  myDependency = await import('my-lib')
}

// Run normally, considering the variable
// can be undefined in some environment.
```

### Static imports + Vite plugin

If you dislike dynamic imports for any reason, it is possible to have conditional static imports by adding [Vite plugin for ISO imports](https://github.com/bluwy/vite-plugin-iso-import):

```js
import lib from 'my-lib?client'

if (!import.meta.env.SSR) {
  // use lib in browser
}
```

```js
import lib from 'my-lib?server'

if (import.meta.env.SSR) {
  // use lib in server
}
```

The static import will be removed conditionally to avoid crashes.

## Separate entry points

If nothing above works for your case, you might want to consider using 2 different entry points (one for the frontend and one for the backend): keep the entry point for the client in your `index.html` (i.e. `src="./src/entry-client.js"` or similar), and run the CLI with `ssr` flag like this:

```bash
vitedge [dev|build] --ssr ./src/entry-server.js
```

You'll need to import Vitedge in your 2 entry points from different places:

```js
// -- Frontend
import vitedge from 'vitedge/vue/entry-client'
// import vitedge from 'vitedge/react/entry-client'

export default vitedge(/* ... */)
```

```js
// -- Backend
import vitedge from 'vitedge/vue/entry-server'
// import vitedge from 'vitedge/react/entry-server'

export default vitedge(/* ... */)
```
