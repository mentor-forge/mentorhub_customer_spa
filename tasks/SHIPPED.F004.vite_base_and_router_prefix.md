# F004 – Vite `base` `/customer/`, router `BASE_URL`, and runtime-config inject

**Status**: Complete  
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

## Goals

- `vite.config.ts` sets `base: '/customer/'`.
- `src/router/index.ts` uses `createWebHistory(import.meta.env.BASE_URL)` and keeps every route `path` unchanged.
- Unauthenticated guard builds a base-aware IdP return URL.
- Runtime-config injection added (`public/runtime-config.js.template`, `public/runtime-config.js`, `.env.development`, and `transformIndexHtml` plugin in `vite.config.ts`).
- `index.html` `<title>` is `Customer`.
- `server.proxy` has `/customer/api` and `/api` proxies.
- `README.md` updated with route table and dev documentation.

## Outputs

Paths are relative to **this SPA repository root**.

**Create:**

- `public/runtime-config.js.template`
- `public/runtime-config.js`
- `.env.development`

**Update:**

- `vite.config.ts`
- `src/router/index.ts`
- `index.html`
- `README.md`

## Execution Notes

1. Created `public/runtime-config.js.template`, `public/runtime-config.js`, and `.env.development`.
2. Updated `vite.config.ts` with `base: '/customer/'`, `injectRuntimeConfig` plugin for `transformIndexHtml` (pre), and `/customer/api` dev proxy.
3. Updated `src/router/index.ts` to `createWebHistory(import.meta.env.BASE_URL)` and base-aware `redirectToIdpLogin` return URL.
4. Updated `index.html` `<title>` to `Customer`.
5. Updated `README.md` with route table and port 8388 dev vs service conflict warning.
6. Ran `npm run test` and `npm run build`; verified `dist/index.html` references `/customer/` paths with no double-prefixes. Packaging verification will run in F005/F006 after container nginx prefix is configured.

