# Custom Rendering (aka Bring Your Own View Library)

Vitedge provides renderers for **Vue and React out of the box** so you don't need to even care about how these libraries run SSR internally. However, for other view libraries or even Vanilla JS, Vitedge exposes its rendering core (`vitedge/core`), which gives you **lower level building blocks** to bring your own rendering logic.

The following is an example with Vanilla JS. It uses a custom server router powered by Vite's `import.meta.globaEager`. Having a router is optional, it could be just 1 page instead. Otherwise, you could use your view library's router (e.g. `react-router-dom`, `vue-router`) or a framework-agnostic router such as [Curi](https://curi.js.org/).

```js
// -- src/entry-server.js
import vitedge from 'vitedge/core/entry-server'

// These are pages following a custom format:
const pageModules = import.meta.globEager('./pages/**/*.js')

// Simple server-only router (i.e. this is not an SPA!):
const serverRouter = new Map()
for (const [path, page] of Object.entries(pageModules)) {
  serverRouter.set(path.replace('./pages', '').replace('.js', ''), page.default)
}

export default vitedge(
  // Optional route resolver to call Page Props.
  // If this returns `true`, the Page Props Handler `<root>/props/<pathname>.js`
  // will be called before entering this route.
  // You can also return `{ name: 'props-handler-name' }` instead
  // to call `<root>/props/props-handler-name.js`.
  (url) => serverRouter.has(url.pathname),
  // Main hook
  async (context) => {
    const { initialState, url, redirect } = context

    // This will be available in the browser during hydration
    initialState.messageFromServer = 'Hello world!'

    // Example of server redirection:
    if (url.pathname === '/redirect-test') {
      return redirect('/', 302)
    }

    // Example of routing:
    const page = serverRouter.get(url.pathname)
    if (page) {
      return page(context)
    }

    return {
      headTags: `<title>Not found</title>`,
      body: `<h1>Route not found</h1>`,
    }
  }
)
```

```js
// -- src/pages/about.js

export default function (context) {
  // Any page logic here.
  // Simply return headTags, htmlAttrs, bodyAttrs and body strings.
  return {
    headTags: '<title>About</title>',
    body: `
      <h1>About page</h1>
      <div>This is the initial state from the server:</div>
      <code>${JSON.stringify(context.initialState)}</code>
    `,
  }
}
```

```js
// -- src/entry-client.js
import vitedge from 'vitedge/core/entry-client'

export default vitedge((context) => {
  const { initialState } = context
  console.log(initialState.messageFromServer)

  // Hydrate page if necessary
  const title = document.querySelector('h1')
  if (title) {
    title.innerText = title.innerText + ` hydrated!`
  }
})
```

Make sure your `index.html` imports `src/entry-client.js`, and that you pass `--ssr src/entry-server.js` to your Vitedge CLI commands.

See a [full example using Vanilla JS](https://github.com/frandiox/vitedge/tree/master/examples/vanilla). For examples with view libraries, check how [Vue](https://github.com/frandiox/vite-ssr/tree/master/src/vue) and [React](https://github.com/frandiox/vite-ssr/tree/master/src/react) renderers are implemented in Vite SSR.
