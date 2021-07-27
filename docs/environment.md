# Loading Environment Variables

Use the `--mode` parameter of the CLI to change the environment file loaded.

## Frontend

Follow Vite's [indications](https://vitejs.dev/guide/env-and-mode.html).

## Backend

Place dotenv files in `<root>/functions/` and Vitedge will load them according to Vite's behavior. Only variables prefixed with `VITEDGE_` will be loaded.

Variables can later be referenced as `import.meta.env.VITEDGE_MY_VARIABLE` (similar to Vite) or `process.env.VITEDGE_MY_VARIABLE` (Node flavor) in the backend handlers.
