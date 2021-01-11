# Loading Environment Variables

Use the `--mode` parameter of the CLI to change the environment file loaded.

## Frontend

Follow Vite's indications.

## Backend

Place dotenv files in `<root>/functions/` and Vitedge will load them according to Vite's behavior.
Variables can later be referenced as `process.env.MY_VARIABLE` in the backend handlers.
