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

This happen if you (or your dependencies) run `eval` or related in a worker environment. Unsafe evaluations are not supported. For example, [`vue-i18n` is affected](https://github.com/intlify/vue-i18n-next/issues/198) by this issue.

## Any error in Vite internals

Try running `vitedge patch` command. This will add some temporary modifications to Vite internals. See [more details here](https://github.com/frandiox/vitedge/tree/master/core/bin/cli.js).
