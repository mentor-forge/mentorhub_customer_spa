# F005 – SPA nginx `/customer/` prefix, container runtime-config, and prefixed API client

**Status**: Complete  
**Type**: Feature  
**Depends On**: `F004_vite_base_and_router_prefix`  
**Description**: Teach container nginx to serve the `/customer/` prefix (assets, Vue history fallback, prefixed API proxy, prefixed `runtime-config.js`), generate `runtime-config.js` from the compose `IDP_LOGIN_URI` at container start, and switch the API client to the prefixed `/customer/api` base so calls from the welcome origin reach `customer_api` through this SPA's nginx. Keep direct-port `/api/` and `/runtime-config.js` for debugging.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md` — container NGINX template substitution; runtime config generated at startup
- `../mentorhub_spa_utils/README.md` — **Cross-SPA URLs**: welcome / ALB origin on `:8080`; direct SPA debug ports (including **8388**) are for Cypress, OpenAPI, and debugging only
- `README.md` — Configuration section (`API_HOST` / `API_PORT`, container listens on port 80)
- `tasks/_ORCHESTRATE.md`
- `tasks/_PLANNING.md`
- `nginx.conf.template` — today: `location /api/` proxying to `http://${API_HOST}:${API_PORT}/api/`, `location /health`, `location /`, and a static-asset cache regex; no prefix awareness and no runtime-config location
- `Dockerfile` — copies `dist` to `/usr/share/nginx/html`, copies `nginx.conf.template`, installs `gettext`, and `envsubst`s only `${API_HOST} ${API_PORT}`; defaults `API_HOST=mentorhub_customer_api`, `API_PORT=8387`; build ARG `VITE_IDP_LOGIN_URI`
- `vite.config.ts` — F004 `base: '/customer/'` (asset **URLs** are prefixed; the build **output folder is still the dist root**)
- `public/runtime-config.js.template` — F004 `envsubst` source
- `src/api/client.ts` — `const API_BASE = '/api'`
- `src/api/client.test.ts` and `src/api/*.client.test.ts` — assert fetch URLs such as `/api/config` and `/api/customer/...`
- `package.json` — `open` currently opens `http://localhost:8388`

## Goals

- `nginx.conf.template` updated with `/customer/api/`, `/api/`, `/customer/` history fallback, static asset caching, `/` redirect to `/customer/`, and `/customer/runtime-config.js` + `/runtime-config.js` no-store endpoints.
- `Dockerfile` sets `IDP_LOGIN_URI` default and runs startup `envsubst` for `runtime-config.js`.
- `src/api/client.ts` uses `const API_BASE = `${import.meta.env.BASE_URL}api``.
- `src/api/client.test.ts` and all `src/api/*.client.test.ts` assert `/customer/api/...`.
- `package.json` `open` script opens `http://localhost:8388/customer/`.
- `README.md` documents welcome origin `:8080/customer/`, direct-port `:8388/customer/`, and API proxy.

## Outputs

Paths are relative to **this SPA repository root**.

**Update:**

- `nginx.conf.template`
- `Dockerfile`
- `src/api/client.ts`
- `src/api/client.test.ts`, `src/api/*.client.test.ts`
- `package.json`
- `README.md`

## Execution Notes

1. Updated `nginx.conf.template` with `/customer/api/`, direct `/api/`, `/customer/` rewrite to dist root with history fallback and `no-store` headers, static asset caching with `public, immutable`, root `/` 302 redirect to `/customer/`, and `runtime-config.js` endpoints.
2. Updated `Dockerfile` to default `ENV IDP_LOGIN_URI` and run `envsubst` on startup for `/usr/share/nginx/html/runtime-config.js`.
3. Updated `src/api/client.ts` to `const API_BASE = `${import.meta.env.BASE_URL}api``.
4. Updated `vitest.config.ts` and all API client tests to assert `/customer/api/...`.
5. Updated `package.json` `open` script to `http://localhost:8388/customer/`.
6. Built Docker image (`npm run container`) and restarted stack with `mh down && mh up customer`.
7. Verified all curl endpoints: `/` redirect, `/customer/` app shell, `/customer/profile/` history fallback, `/customer/runtime-config.js` generated config, `/customer/api/config` proxy reach, and `:8080/customer/` welcome proxy serving.
8. `npm run cypress:run` will be executed in F006 as part of the Cypress suite rewrite.

