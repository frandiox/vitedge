# Troubleshooting

## Cannot import ESM

Vitedge works using ES Modules in modern Node.js (>=12). Make sure the Node version is compatible and that you have `"type": "module"` in your `package.json`.

## Cannot use Tailwind/PostCSS

Rename their config files to `postcss.config.cjs` and `tailwind.config.cjs`.
Then, specify the Tailwind config route in PostCSS config:

```js
module.exports = {
  plugins: {
    tailwindcss: { config: './tailwind.config.cjs' },
    autoprefixer: {},
  },
}
```

## Code generation from strings disallowed for this context

This happen if you (or your dependencies) run `eval` or related in a worker environment. Unsafe evaluations are not supported. For example, [`vue-i18n` was affected](https://github.com/intlify/vue-i18n-next/issues/198) by this issue.

## Some library/component crashes during SSR

Have a look at [Conditional Rendering section](./conditional-rendering)

## Vite is not bundling my dependencies correctly

There are some known issues in Vite resolution/bundling behavior (e.g. with `aws-sdk` package). If that's your case, try to mark your dependency as "external" to avoid bundling it. Later, Webpack or ESBuild will try to bundle it when creating the final worker script.

For example, if you are importing `aws-sdk` in your backend function, you can mark it as external in the plugin options as follows:

```js
vitedge({
  functions: {
    build: {
      rollupOptions: {
        external: ['aws-sdk'],
      },
    },
  },
})
```
