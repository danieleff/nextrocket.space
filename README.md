# nextrocket.space

Overview of upcoming rocket launches: https://nextrocket.space

Launch data comes from the [thespacedevs.com](https://thespacedevs.com/) Launch Library API and is stored in PostgreSQL. The page is rendered on the server with React, then updated in the browser.

## Layout

- `client/`: React UI (bundled by webpack into `public/static/`)
- `server/`: Express server, database access and the thespacedevs sync
- `public/images/`: icons and logos served as-is

## Running locally

Requires Node.js 24+ and a PostgreSQL database with the `launch_library_v2_*` tables (see `server/database.ts`).

```sh
npm ci
export NEXTROCKET_DB_HOST=localhost NEXTROCKET_DB_PORT=5432 \
       NEXTROCKET_DB_DATABASE=nextrocket NEXTROCKET_DB_USER=nextrocket \
       NEXTROCKET_DB_PASSWORD=... NEXTROCKET_ADMIN_PASSWORD=...
npm start      # tsc, webpack and the server in watch mode, on http://localhost:3000
```

`npm run build` compiles once (used by the Dockerfile).

Opening the site with `?admin_pwd=<NEXTROCKET_ADMIN_PASSWORD>` enables editing of payload and destination per launch.

## Deployment

Every push to `master` runs `.github/workflows/deploy.yml`:

1. Builds the Docker image and pushes it to `ghcr.io/danieleff/nextrocket.space:latest`.
2. Connects to the server over SSH with a restricted deploy key. The server only allows that key to pull and restart the `webserver` container.

The production compose file and secrets live on the server only, not in this repo.

Required repository secrets: `DEPLOY_HOST`, `DEPLOY_KEY`, `DEPLOY_KNOWN_HOSTS`.
