# F004 – Vite `base` `/customer/`, router `BASE_URL`, and runtime-config inject

**Status**: Pending  
**Type**: Feature  
**Depends On**: `F003_adopt_page_frame`  
**Description**: Mount the app at Vite `base: '/customer/'` with `createWebHistory(import.meta.env.BASE_URL)` so browser URLs are `/customer/...` and never `/customer/customer/...`. Add base-aware runtime-config injection, a base-aware IdP return URL, and a prefixed dev proxy. Route `path` strings stay unchanged. Do not change `nginx.conf.template`, the `Dockerfile`, or `src/api/client.ts` in this task — that is F005.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md` — container runtime config: load the generated `runtime-config.js` from `index.html` **before** the app bundle via a Vite `transformIndexHtml` plugin
- `../mentorhub_spa_utils/README.md` — IdP login URL resolution order (`window.__MENTORHUB_RUNTIME__.IDP_LOGIN_URI` → `VITE_IDP_LOGIN_URI` → Developer Edition fallback); **Cross-SPA URLs** (welcome / ALB origin on `:8080`; direct SPA debug ports are for Cypress, OpenAPI, and debugging only)
- `README.md`
- `tasks/_ORCHESTRATE.md`
- `tasks/_PLANNING.md`
- `tasks/PENDING.F001.retire_list_dashboards.md` — locked route table with the resulting `/customer/...` browser URLs
- `vite.config.ts` — today: no `base`, no runtime-config inject, `server.port` 8388, `server.proxy` `/api` → `http://localhost:8387`
- `src/router/index.ts` — after F001/F003: `createWebHistory()`, `/`, `/profile/`, `/profile/:id`, kept detail routes, `/config`
- `index.html` — Vite entry; `<title>Mentor Hub Login</title>`, `<link rel="icon" href="/vite.svg">`, `/src/main.ts` (asset URLs follow `base` automatically)
- `src/App.vue` — after F003 this is `v-app` → `PageFrame` → `router-view`, with no local logout URL to make base-aware
- `vitest.config.ts` — already sets `VITE_IDP_LOGIN_URI` for unit tests

**Source issue**: F-CS11. Developer Edition welcome nginx (mentorhub L022) already forwards the **full** URI `http://<host>:8080/customer/` to this container with `X-Forwarded-Prefix: /customer`, and the cloud ALB forwards the full URI too. Do **not** rely on a welcome `rewrite` hack, and do not change welcome nginx, the cloud ALB, CloudFormation, or the Customer API. Direct port **8388** stays published.

**Prefix, not route paths:** with `base: '/customer/'`, Vue route `path` strings stay `/`, `/profile/`, `/subscriptions/:id`, … and the browser shows `/customer/`, `/customer/profile/`, `/customer/subscriptions/{id}`. Duplicating the prefix inside route `path` strings would produce `/customer/customer/...` — do not do it.

Vite `base` changes asset **URLs** only; the build output stays in the `dist` root. Nothing in this task creates a `dist/customer/` folder.

`IDP_LOGIN_URI` remains `http://<HOST_NAME>:8080/login.html`.

## Goals

- `vite.config.ts` sets `base: '/customer/'`. There is exactly one base and one build — no second root-only build or profile.
- `src/router/index.ts` uses `createWebHistory(import.meta.env.BASE_URL)` and keeps every route `path` exactly as F001 left it.
- The unauthenticated guard builds a base-aware IdP return URL so a deep link returns to the prefixed page: origin + `import.meta.env.BASE_URL` + the route path without its leading slash (`/profile/` → `http://<host>:8388/customer/profile/`). It must never produce `/customer/customer/...` and never drop the prefix.
- Runtime-config injection is added and is **base-aware**:
  - a `transformIndexHtml` (order `pre`) Vite plugin seeds `window.__MENTORHUB_RUNTIME__` and injects `<script src="${base}runtime-config.js">` **before** the module bundle, and rewrites the `vite.svg` icon href to the base,
  - `public/runtime-config.js.template` contains the `envsubst` source assigning `IDP_LOGIN_URI` onto `window.__MENTORHUB_RUNTIME__`,
  - `public/runtime-config.js` is committed as the harmless dev-server placeholder (container startup overwrites the generated copy in F005),
  - `.env.development` sets `VITE_IDP_LOGIN_URI=http://127.0.0.1:8080/login.html` so `npm run dev` keeps working.
- `index.html` `<title>` becomes `Customer` instead of `Mentor Hub Login` (the router already sets the same title after navigation).
- `server.proxy` gains `'/customer/api'` → `http://localhost:8387` with a rewrite that strips `/customer` so the API still sees `/api/...`, and keeps the existing `/api` proxy for direct-port debugging.
- `README.md` documents that `npm run dev` serves the app at `http://localhost:8388/customer/`, lists the in-app URLs from the F001 route table, and warns that `npm run dev` and `npm run service` both bind host port **8388** and cannot run at once.
- Do not change `nginx.conf.template`, `Dockerfile`, `package.json`, or `src/api/client.ts` — the API client stays on `/api` until F005.

## Testing Expectations

Run all commands from **this SPA repository root**.

- `npm run test` — update any unit test that asserts an un-prefixed return URL
- `npm run build` — then inspect `dist/index.html`: asset, favicon, and `runtime-config.js` URLs all start with `/customer/`, and there is no `/customer/customer` anywhere in the generated HTML. Confirm the build output is still the `dist` root (no `dist/customer/` folder).
- `npm run api` then `npm run dev` — manual check:
  - `http://localhost:8388/customer/` renders the customer edit page
  - `http://localhost:8388/customer/profile/` renders the profile page
  - a deep link opened while logged out returns to the same prefixed URL after the IdP round trip
  - the browser network tab shows `runtime-config.js` requested from `/customer/runtime-config.js`
  - API calls succeed through the dev proxy

**Packaging verification** is **F005**: container nginx still serves only `/`, so `npm run container` / `npm run service` cannot serve the prefix yet, and `npm run cypress:run` (baseUrl `http://localhost:8388`) is expected to fail until F005 ships nginx and F006 re-points the specs. Do not run Cypress as a gate in this task; state that explicitly in Execution Notes.

## Outputs

Paths are relative to **this SPA repository root**.

**Create:**

- `public/runtime-config.js.template` — `envsubst` source for `IDP_LOGIN_URI`
- `public/runtime-config.js` — dev placeholder
- `.env.development` — `VITE_IDP_LOGIN_URI`

**Update:**

- `vite.config.ts` — `base`, runtime-config inject plugin, `/customer/api` dev proxy
- `src/router/index.ts` — history base and base-aware IdP return URL
- `index.html` — page title
- `README.md` — prefixed dev URL, route list, port-8388 conflict note

Do not change `nginx.conf.template`, `Dockerfile`, `package.json`, `cypress.config.ts`, or `src/api/client.ts` in this task.

## Execution Notes

_Reserved for the task execution agent: plan, commands run, test results, follow-ups._
