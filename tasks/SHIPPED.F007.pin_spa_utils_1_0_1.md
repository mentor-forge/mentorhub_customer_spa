# F007 – Pin `@mentor-forge/mentorhub_spa_utils@1.0.1`

**Status**: Shipped  
**Type**: Feature  
**Depends On**: _(none — first task in this wave)_  
**Description**: This repo owns the Customer SPA **1.0.1 pin** (issue F-CS13 / GitHub #17). Bump `@mentor-forge/mentorhub_spa_utils` from exact `1.0.0` to exact **`1.0.1`**, refresh the lockfile from CodeArtifact, and fix any compile or unit-test breakage from the 1.0.1 catalog, logout `return_to=/discovery/`, Settings `hostingConfigHref`, and Token claims. Do **not** change routes in this task.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md` — exact semver pins for shared packages; CodeArtifact (`mh` then `npm install`)
- `../mentorhub_spa_utils/README.md` — install pin **1.0.1**; **Universal PageFrame** (1.0.1 catalog: Home, Events, Resources, Paths, Plans; Notifications + Settings **admin-only**; Settings = `hostingConfigHref()` → `{origin}/{prefix}/config`; empty/missing roles → Home + Events); logout `logout()` then `redirectToIdpLogin(buildJourneyUrl('discovery'))` → `/discovery/`; **Admin config and Token claims**; removed hamburger ids `nav-products-link`, `nav-customer-link`, `nav-customer-members-link`; new `nav-events-link`
- `README.md` — currently documents spa_utils **1.0.0**; In-App Route Table already lists `/customer/config`; Automation Support still lists 1.0.0 rows (`nav-customer-link`, `nav-customer-members-link`, `nav-products-link`) and treats Notifications as always present
- `tasks/_ORCHESTRATE.md`
- `tasks/_PLANNING.md`
- `package.json` / `package-lock.json` — currently `"@mentor-forge/mentorhub_spa_utils": "1.0.0"`
- `src/App.vue` — `PageFrame` with `page-title="Customer"` only (keep; do not add `navItems`, ALB URLs, or role tables)
- `src/initAuth.ts` — `bootstrapAuthFromUrl()` then `syncAuthFromStorage()` (keep)
- `src/pages/AdminPage.vue` — already imports `{ AdminPage }` from spa_utils (do not change the host wrapper here)
- `src/router/index.ts` — `/config` is already registered with `requiresAuth` + `requiresRole: 'admin'` (F001); route-table wording as the Settings / `hostingConfigHref` host is **F008**
- `cypress/e2e/navigation.cy.ts` — still encodes the **1.0.0** catalog (customer Home + Customer + Customer Members + Notifications; admin Products + Settings → `/admin/settings`; logout comment that `return_to` is the root origin)
- `vitest.config.ts` — inlines `@mentor-forge/mentorhub_spa_utils`; no version comment to update unless 1.0.1 changes the inline setting

**Source issue**: F-CS13 ("Pin spa_utils 1.0.1 and host AdminPage at /customer/config"). This task delivers **only** the pin.

**External prerequisite**: `mentorhub_spa_utils` F041–F046 shipped and **`@mentor-forge/mentorhub_spa_utils@1.0.1` is published to CodeArtifact**. Vue `base` + SPA nginx prefix `/customer/` are already shipped (F004–F006 / mentorhub L022). Run `mh`, then `npm view @mentor-forge/mentorhub_spa_utils version`. If **1.0.1** is not available, set this task **Status** to `Blocked`, rename the file to `BLOCKED.F007.pin_spa_utils_1_0_1.md`, and stop — do not stay on `1.0.0` and do not point `package.json` at a git URL.

This SPA is the **first** `mentorhub_customer_spa` issue in the 1.0.1 wave and **owns this repo’s pin**. Sibling SPAs pin independently; do not change other repos.

**Out of scope**: README Settings-host wording and router unit tests (F008). Cypress catalog / Settings / Token / logout `return_to` assertions (F009). Do not pass `navItems`, ALB origins, or role tables into `PageFrame`. Do not override logout locally. Do not restore Products / Customer / Customer Members drawer rows. Do not add list dashboards.

### Wave ordering

Pin (F007) → config route as Settings host (F008) → Cypress and packaging (F009). Pinning first makes the 1.0.1 `PageFrame` catalog, `hostingConfigHref()`, Token claim labels, and logout `return_to` available before F008 documents `/customer/config` as the Settings destination. Cypress still encodes the 1.0.0 catalog, so **do not run** `npm run cypress:run` here.

## Goals

- `package.json` pins `"@mentor-forge/mentorhub_spa_utils": "1.0.1"` — exact semver, **no caret**.
- `package-lock.json` resolves `1.0.1` from the CodeArtifact registry after `mh` and `npm install --include=dev`.
- `npm ls @mentor-forge/mentorhub_spa_utils` reports `1.0.1`.
- The app still builds and unit-tests: `PageFrame` still receives only `pageTitle` (`page-title="Customer"`). IdP bootstrap / `urlAuthBootstrap` / `redirectToIdpLogin` stay as today. Logout `return_to` remains owned by spa_utils — do not add a local logout handler and do not re-introduce `handleLogout`.
- `README.md` names the pinned version **1.0.1** in ownership / component notes. Document the 1.0.1 hamburger catalog in prose (Home, Events, Resources, Paths, Plans; Notifications and Settings **admin-only**; Settings lands on this SPA’s `/config`; Products / Customer / Customer Members are **not** hamburger rows). Do not invent a local nav config API. Keep the existing In-App Route Table row for `/customer/config`; F008 owns calling it the Settings / `hostingConfigHref` host (Token / Config Items / Versions / Enumerators, no `:8080` rewrite).
- Fix any `src/**` import or type breakage from 1.0.1. Do not add or rename routes in this task. Keep existing detail/edit/create pages (customer home, profile, subscriptions, dashboards, cards, events, journeys, ratings, notes) and the existing `/config` AdminPage wrapper.
- `vitest.config.ts` may be touched **only** if 1.0.1 changes whether the package must be inlined for Vitest. Do not change coverage thresholds.
- The three spa_utils Cypress subpath imports still resolve under 1.0.1: `cypress/jwtDefaults`, `cypress/registerJwtSignTask`, and `cypress/registerAuthCommands`. If a subpath or option name moved, update the import here — do **not** vendor a local copy. Do not rewrite `navigation.cy.ts` catalog expectations here.

### Craftsmanship Expectations

- Reuse `mentorhub_spa_utils` for shared SPA behavior rather than creating local equivalents.
- Treat DRY as avoiding duplicated knowledge: catalog, logout `return_to`, and Settings href are owned by 1.0.1 `PageFrame` / `hostingConfigHref` / `buildJourneyUrl`. Do not grow a parallel hamburger.
- Keep journey-specific behavior in this SPA; do not restore Products / Customer / Members drawer rows locally.
- Prefer deleting obsolete local behavior when responsibility has moved to spa_utils. Do not introduce local workarounds for 1.0.1 catalog or logout.

## Testing Expectations

Run all commands from **this SPA repository root**.

- `mh` (CodeArtifact auth) then `npm install --include=dev`
- `npm ls @mentor-forge/mentorhub_spa_utils` — confirm **1.0.1**
- `npm run test` — full Vitest suite
- `npm run test:coverage` — the `src/api/**`, `src/composables/**`, and `src/components/**` thresholds in `vitest.config.ts` must still hold
- `npm run build` — `vue-tsc` must be clean. **This repo defines no `lint` script**, so `npm run build` is the type gate. Do not add a lint script in this task.

Do **not** run `npm run cypress:run` in this task. Existing Cypress still encodes the 1.0.0 catalog (`nav-products-link`, `nav-customer-link`, `nav-customer-members-link`, Settings → `/admin/settings`, customer Notifications, logout to root origin). Leave those specs to F009. Do not “fix” them here unless a unit test or `vue-tsc` fails.

Packaging (`npm run container` / `npm run service`) is **F009**.

## Outputs

Paths are relative to **this SPA repository root**.

**Update:**

- `package.json` — `"@mentor-forge/mentorhub_spa_utils": "1.0.1"`
- `package-lock.json` — resolved 1.0.1 from CodeArtifact
- `README.md` — spa_utils version note and 1.0.1 catalog ownership (keep the existing `/customer/config` route-table row; do not rewrite it as the Settings host yet)
- `vitest.config.ts` — only if 1.0.1 requires a change to the inline setting
- `cypress.config.ts`, `cypress/support/e2e.ts` — only if a spa_utils Cypress subpath or option moved in 1.0.1
- Any `src/**` import or type that fails to compile against 1.0.1

Do not change the `/config` route. Do not pass disallowed `PageFrame` props. Do not change Cypress specs in this task unless a compile of test helpers breaks. Do not change `src/router/index.ts`, `vite.config.ts`, `nginx.conf.template`, or `Dockerfile`.

## Execution Notes

1. Verified `@mentor-forge/mentorhub_spa_utils@1.0.1` is published on CodeArtifact (`npm view` after `mh`).
2. Updated `package.json` to exact pin `"@mentor-forge/mentorhub_spa_utils": "1.0.1"`; ran `npm install --include=dev`; lockfile resolves 1.0.1 from CodeArtifact.
3. No `src/**`, `vitest.config.ts`, or Cypress helper changes required — 1.0.1 is API-compatible with existing imports and Cypress subpaths (`cypress/jwtDefaults`, `cypress/registerJwtSignTask`, `cypress/registerAuthCommands`).
4. Updated `README.md`: version notes to 1.0.1; 1.0.1 PageFrame catalog prose in Reusable Components (route-table row for `/customer/config` unchanged; Automation Support left for F009).

### Test results

| Command | Result |
|---------|--------|
| `npm ls @mentor-forge/mentorhub_spa_utils` | `1.0.1` |
| `npm run test` | 14 files, 57 tests passed |
| `npm run test:coverage` | Passed; thresholds met (`api` 97.69% lines, `composables` 96.32%, `components` N/A — no component files in coverage scope) |
| `npm run build` | `vue-tsc` clean; Vite build succeeded |
