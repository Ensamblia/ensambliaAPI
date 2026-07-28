# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Ensamblia is a platform connecting musicians/bands. Three-tier architecture: a React SPA (`frontend/`) talks to a Node.js/Express REST API (`src/`), which reads/writes a PostgreSQL database (schema `ensamblia`, expected in a Docker container on port 5434 — no `docker-compose.yml` currently exists in the repo despite being referenced in README/GUIA_EQUIPO.md).

## Commands

Backend (repo root):
```bash
npm run dev      # nodemon src/app.js — API on http://localhost:3000
npm start         # node src/app.js
```

Frontend (`frontend/`):
```bash
npm run dev       # vite dev server on http://localhost:5173
npm run build     # vite build
npm run lint      # oxlint
npm run preview
```

There is no test runner configured for either package (`npm test` at root is a stub).

Backend requires a `.env` in the repo root with `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and (for auth) `JWT_SECRET`, `JWT_EXPIRES_IN`, and optionally `ADMIN_USER`/`ADMIN_PASSWORD_HASH` for a hardcoded admin login fallback.

## Backend architecture (`src/`)

Standard layered structure, one triplet per entity:
- `models/<entity>Model.js` — raw `pg` queries against schema-qualified tables (`ensamblia.<table>`), returns `result.rows`/`result.rows[0]`.
- `controllers/<entity>Controller.js` — thin HTTP layer around the model; every handler wraps its logic in try/catch and on error returns `500` with `{ name, message, code, detail, hint, position }` taken directly from the pg error object (this is how DB errors surface, not through custom error classes).
- `routes/<entity>Routes.js` — an `express.Router()` mapping REST verbs to controller functions.

Each route module is mounted individually in `src/app.js` under `/api/<plural-entity>` (e.g. `perfilInstrumentoRoutes` → `/api/perfil-instrumentos`). When adding a new entity, follow the existing model→controller→routes pattern (see `perfilInstrumentoModel.js`/`Controller.js`/`Routes.js` for a complete reference implementation, including junction-table-style composite-key entities), then register the router in `src/app.js`.

Many-to-many relationships between entities (e.g. perfil↔instrumento, perfil↔genero_musical, perfil↔chat) are modeled as their own explicit entity/table rather than nested arrays — each has its own model/controller/routes triplet with composite-key lookups (`getById(idA, idB)`), not a single auto-increment id.

`src/db.js` exports a single shared `pg.Pool` built from env vars; every model imports this pool directly.

**Known gaps to be aware of before touching auth:**
- `authController.js` (`login`/`register`) is wired up at `POST /api/auth/register` and `POST /api/auth/login` in `src/routes/authRoutes.js`. Both require `JWT_SECRET` to be set in `.env` (not present by default) or they return `500`.
- `controllers/middlewares/authMiddleware.js` verifies a Bearer JWT via `JWT_SECRET` but is not applied to any route yet — protected routes still need it added.
- `controllers/middlewares/handleValidation.js` (express-validator) is installed but not used by any route — there are no validation chains defined yet.
- See `tablas_por_hacer.txt` for which entities still lack full CRUD coverage.

## Frontend architecture (`frontend/src/`)

- `api/axios.js` — single shared Axios instance, baseURL hardcoded to `http://localhost:3000/api`. All API calls should go through this instance.
- `context/AuthContext.jsx` — global `user`/`setUser` state via React Context; not yet persisted or wired to real login.
- `router/AppRouter.jsx` — top-level `BrowserRouter` wrapping every route in a shared `Navbar`; unmatched paths redirect to `/`.
- `components/` is organized by domain, not by page: `navbar/`, `cards/`, `filters/`, `chat/`. New reusable UI should follow this domain-folder convention rather than a generic `components/common/`.
- `pages/` holds one file per route (`HomePage`, `AnunciosPage`, `PerfilPage`, `ChatPage`), each composing components and calling the API client directly in `useEffect`.

Lint rules (`.oxlintrc.json`) enforce `react/rules-of-hooks` as an error — pay attention to conditional hook calls.

## Git workflow

Per `GUIA_EQUIPO.md`: nobody commits directly to `main` or `Marga-front`. `Marga-front` is the integrated base branch; feature work happens on a personal branch (`nombre/funcionalidad`) and merges back to `Marga-front` via PR, not to `main`.
