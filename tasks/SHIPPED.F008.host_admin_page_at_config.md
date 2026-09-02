# F008 – Host packaged `AdminPage` at `/customer/config`

**Status**: Shipped  
**Type**: Feature  
**Depends On**: `F007_pin_spa_utils_1_0_1`  
**Description**: Keep Vue `path: '/config'` under the existing journey `base` so Settings (`hostingConfigHref()`) lands on **this** SPA at `/customer/config`. Reuse the existing packaged `AdminPage` wrapper. Gate the route with the **admin** role; non-admins redirect away. Keep existing detail/edit pages. Do not pass nav config into `PageFrame`.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `../mentorhub_spa_utils/README.md` — **Universal PageFrame**: Settings is **admin-only** and uses `hostingConfigHref()` → `{origin}/{journeyPrefix}/config` (not `/admin/settings`, not welcome-port rewrite). **Admin config and Token claims**: Token tab ids `admin-token-profile-id-display`, `admin-token-customer-id-display`, `admin-token-mentor-id-display`
- `README.md` — In-App Route Table already lists `/customer/config` as `AdminPage.vue` (`admin` role required); it does not yet name it as the hamburger Settings / `hostingConfigHref` host
- `tasks/_ORCHESTRATE.md`
- `tasks/_PLANNING.md`
- `src/router/index.ts` — `/config` already loads `src/pages/AdminPage.vue` with `requiresAuth` + `requiresRole: 'admin'` (F001); missing role calls `window.location.replace(buildJourneyUrl(JOURNEY_APP_PATHS.home.journey, JOURNEY_APP_PATHS.home.path))` then `next(false)`; there is **no** catch-all and **no** `/admin` route
- `src/pages/AdminPage.vue` — already imports `{ AdminPage }` from `@mentor-forge/mentorhub_spa_utils` and feeds `GET` config via `api.getConfig()`
- `src/App.vue` — `PageFrame` with `page-title="Customer"` only
- `src/initAuth.ts` — keep IdP bootstrap / `urlAuthBootstrap` as today
- `vite.config.ts` — `base: '/customer/'` already shipped (F004); Vue `path: '/config'` is browser URL `/customer/config`

spa_utils 1.0.1 compiles Settings to **this** SPA’s `/customer/config` on the **current origin** (Vite/container `:8388` during Cypress; welcome `:8080` when entered through ALB). The hamburger must not be given local `navItems`. Do not hard-code ALB URLs or role tables on `PageFrame`.

This SPA already hosts AdminPage at `/config` (F001 retired `/admin`). **Do not add a second admin path.** Do not reintroduce `/admin` as an alias unless a kept bookmark would otherwise 404 — there is no `/admin` route after F001, and Cypress should target `/customer/config` (F009). If `/config` is missing or un-gated when this task runs, add it with `requiresAuth` + `requiresRole: 'admin'` **before** any later catch-all; do not duplicate the prefix inside the route `path` (that would produce `/customer/customer/config`).

**Out of scope**: Cypress click-through, Token tab, catalog rows, logout `return_to`, and non-admin redirect coverage (F009). Do not add Events as a list dashboard. Do not change the spa_utils pin.

## Goals

- Vue route `path: '/config'` (public URL **`/customer/config`** under existing Vite `base` `/customer/`) renders the existing packaged `AdminPage` wrapper. Import remains `{ AdminPage }` from `@mentor-forge/mentorhub_spa_utils`.
- Gate `/config` with the **admin** role using the existing `requiresRole: 'admin'` pattern. Unauthenticated callers still hit IdP via the existing `requiresAuth` guard (`redirectToIdpLogin`). Authenticated non-admins redirect away via the existing `buildJourneyUrl` Discovery fallback — do not invent a local Home page to absorb the gate, and do not send them to CustomerEdit as an in-app substitute.
- Keep existing detail/edit/create pages and routes: `/` (`CustomerEditPage`), `/profile/` + `/profile/:id`, subscriptions, dashboards, cards, events, journeys, ratings, and notes. Config route only — no new list dashboards, no Products / Customer / Members pages, no Events collection route.
- Do **not** pass `navItems`, ALB URLs, or role tables into `PageFrame`. Settings is already in the compiled 1.0.1 catalog (`hostingConfigHref()` → `{origin}/customer/config`).
- README In-App Route Table names `/customer/config` as the admin Settings host (Token / Config Items / Versions / Enumerators). Note that hamburger Settings stays on the hosting origin (no `:8080` rewrite). Do not list `/admin/settings` or a local `/admin` path as the Settings destination.
- No new local admin chrome. Token claim labels/ids are owned by spa_utils 1.0.1 `TokenClaimsCard`. Do not restore Products / Customer / Customer Members hamburger rows locally.

### Craftsmanship Expectations

- Reuse the packaged `AdminPage`; do not fork Config/Token UI locally.
- Treat DRY as avoiding duplicated knowledge: the Settings href is `hostingConfigHref()`, not a Customer-owned URL table and not `/admin/settings`.
- Prefer keeping the single existing `/config` host; do not add a parallel `/admin` implementation.
- Keep journey-specific edit/detail pages in this SPA; do not reintroduce collection lists that belong on Discovery.

## Testing Expectations

Run all commands from **this SPA repository root**.

- `npm run test`
- `npm run test:coverage` — thresholds unchanged (`src/router/**` is excluded from coverage; a colocated router test does not need to move the exclude)
- `npm run build` — `vue-tsc` is the type gate (this repo defines no `lint` script)

Do not add Cypress here (F009). Router unit tests are optional; pages remain E2E-covered in F009. If a router test is added, cover: admin can resolve `/config`; authenticated non-admin `requiresRole` does not stay on `/config` (existing Discovery fallback is correct). This repo has no `src/App.test.ts`; do not add one here.

Optional smoke (`npm run api` then `npm run dev` at `http://localhost:8388/customer/`): an admin token can open `/customer/config`; a customer-only token is sent away; `/customer/` and `/customer/profile/` still render. Do not treat this as a substitute for F009.

Do not run `npm run dev` and `npm run service` at the same time — both bind host port **8388**.

## Outputs

Paths are relative to **this SPA repository root**.

**Update:**

- `src/router/index.ts` — only if `/config` is missing, un-gated, or would 404 under 1.0.1 Settings; otherwise leave the existing admin-gated record
- `src/pages/AdminPage.vue` — only if the wrapper must change to stay the single `/config` host
- `README.md` — `/customer/config` as the Settings / AdminPage host (Token / Config Items / Versions / Enumerators); hamburger Settings stays on the hosting origin
- A colocated router unit test **only if** one is added for the `/config` role gate (`src/router/index.test.ts`)

Do not add Events or list pages. Do not pass disallowed `PageFrame` props. Do not change the spa_utils pin. Do not rewrite `cypress/e2e/navigation.cy.ts` in this task. Do not reintroduce `/admin`.

## Execution Notes

### Plan

- Verify `/config` route, `AdminPage.vue` wrapper, and `PageFrame` props against task goals.
- Update README In-App Route Table to name `/customer/config` as the Settings host.
- Optionally add colocated router unit tests for admin/non-admin `/config` gate.

### Results

- **Router (`src/router/index.ts`)**: No change. `/config` already loads `AdminPage.vue` with `requiresAuth: true` and `requiresRole: 'admin'`; non-admins redirect via `buildJourneyUrl(JOURNEY_APP_PATHS.home…)` + `window.location.replace`. No `/admin` route or alias.
- **AdminPage (`src/pages/AdminPage.vue`)**: No change. Already wraps packaged `{ AdminPage }` from `@mentor-forge/mentorhub_spa_utils@1.0.1` and feeds `GET /customer/api/config` via `api.getConfig()`.
- **App.vue / PageFrame**: No change. Only `page-title="Customer"` — no `navItems`, ALB URLs, or role tables passed.
- **README.md**: Updated In-App Route Table row for `/customer/config` — Settings host (Token / Config Items / Versions / Enumerators); hamburger Settings stays on hosting origin via `hostingConfigHref()` (no `:8080` rewrite).
- **Router test (`src/router/index.test.ts`)**: Added 3 tests — resolve `/config` to admin-gated Admin route; admin stays on `/config`; authenticated non-admin redirected to Discovery via `buildJourneyUrl('discovery', '')`. No `/admin` alias test (route retired in F001).

### Test results (repo root)

| Command | Result |
|---------|--------|
| `npm run test` | 15 files, **60 passed** (57 prior + 3 router) |
| `npm run test:coverage` | **60 passed**; thresholds met (`api/**` 97.69% lines; `composables/**` 96.32% lines) |
| `npm run build` | **vue-tsc clean**; Vite build succeeded |

### Blockers

None.
