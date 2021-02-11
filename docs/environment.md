# Loading Environment Variables

Use the `--mode` parameter of the CLI to change the environment file loaded.

## Frontend

Follow Vite's indications.

## Backend

Place dotenv files in `<root>/functions/` and Vitedge will load them according to Vite's behavior. Only variables prefixed with `VITEDGE_` will be loaded.

Variables can later be referenced as `process.env.VITEDGE_MY_VARIABLE` in the backend handlers.
