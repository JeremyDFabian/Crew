# Crew

Study session scheduling for high schoolers. See [`PRODUCT.md`](PRODUCT.md) and [`DESIGN.md`](DESIGN.md).

## Stack

- `client/` — Vite + React + TypeScript UI (port 5173)
- `server/` — Node + Express API (port 3000)
- `matching-service/` — Python + Flask matching service (port 5001)

## Prerequisites

- Node 20+ and npm
- Python 3.11+

## Getting started

From the repo root:

```sh
npm install          # installs concurrently
npm run setup        # installs server + client deps, creates Python venv, installs matching-service deps
cp server/.env.example server/.env
npm run dev          # starts all three services with combined logs
```

Then open:

- UI: http://localhost:5173
- API: http://localhost:3000/api/health
- Matching: http://localhost:5001/api/health

The UI currently runs on local mock data and does not call the APIs yet; the server and matching service only expose health checks while the real API is built out.

## Scripts

| Command | What it does |
|---|---|
| `npm run setup` | One-time install of all three services' dependencies. |
| `npm run dev` | Runs client + server + matching together, color-coded. Ctrl-C kills all three. |
| `npm run dev:client` | Just the Vite client. |
| `npm run dev:server` | Just the Node API. |
| `npm run dev:matching` | Just the Python matching service. |

## Client env

The client reads two optional env vars (Vite-prefixed). Defaults work for local dev:

```sh
# client/.env.local
VITE_API_URL=http://localhost:3000
VITE_MATCHING_URL=http://localhost:5001
```

## Notes for non-Windows

The `dev` and `setup` scripts assume Windows venv paths (`matching-service/.venv/Scripts/...`). On macOS/Linux, swap `Scripts` for `bin` in `package.json`.
