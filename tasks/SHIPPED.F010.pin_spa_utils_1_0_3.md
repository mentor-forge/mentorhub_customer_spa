# F010 – Pin `@mentor-forge/mentorhub_spa_utils@1.0.3` (`token.display_name`)

**Status**: Shipped  
**Type**: Feature  
**Depends On**: _(none — first task in this wave)_  
**Description**: This repo owns the Customer SPA **1.0.3 pin** ([F-CS14 / GitHub #19](https://github.com/mentor-forge/mentorhub_customer_spa/issues/19)). Bump `@mentor-forge/mentorhub_spa_utils` from exact `1.0.2` to exact **`1.0.3`**, refresh the lockfile from CodeArtifact, and replace any local use of token `name` with token `display_name`. Do **not** change routes in this task.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md` — exact semver pins for shared packages; CodeArtifact (`mh` then `npm install`)
- `../mentorhub_spa_utils/README.md` — install pin **1.0.3**; **PageFrame** shows JWT `display_name` next to the avatar (`nav-profile-name-display`) with **no** fallback to `name` / `given_name` / `email` / `user_id` / `sub`; Token tab (`TokenClaimsCard`) field `display_name` with id `admin-token-display-name-display`; missing string claims display `N/A`
- `README.md` — currently documents spa_utils **1.0.2**; Token claim ids listed as `admin-token-profile-id-display`, etc., without `display_name`; local claim readers are `customer_id` / `profile_id` only
- `tasks/_ORCHESTRATE.md`
- `tasks/_PLANNING.md`
- `package.json` / `package-lock.json` — currently `"@mentor-forge/mentorhub_spa_utils": "1.0.2"`
- `src/App.vue` — `PageFrame` with `page-title="Customer"` only plus `provideEditorConfig` (keep; do not add `navItems`, ALB URLs, or role tables)
- `src/initAuth.ts` — `bootstrapAuthFromUrl()` then `syncAuthFromStorage()` (keep)
- `src/pages/AdminPage.vue` — already imports `{ AdminPage }` from spa_utils and passes `GET /customer/api/config` (do not fork TokenClaimsCard locally)
- `src/pages/CustomerEditPage.vue` / `src/pages/ProfilePage.vue` — document `name` editors; **do not rename**
- `src/api/types.ts` — `ConfigResponse.token` is currently `{ claims?: Record<string, unknown> }`
- `src/api/types.test.ts` — token fixture uses nested `claims` (`sub`, `roles`); Customer / Profile / Event **document** `name` fixtures are not the token display claim
- `src/composables/useAuth.ts` / `src/composables/useAuth.test.ts` — `getStoredClaim` / `getStoredCustomerId` / `getStoredProfileId`; do not add a local `name` → `display_name` mapper
- `src/composables/useConfig.ts` / `src/composables/useConfig.test.ts` — enumerator / collection `name` fields are **not** the token display claim
- `src/composables/useRoles.ts` / `src/composables/useRoles.test.ts` — config token `roles` fallback; do not invent token `name`
- `vitest.config.ts` — inlines `@mentor-forge/mentorhub_spa_utils`; no version comment to update unless 1.0.3 changes the inline setting

**Source issue**: [F-CS14](https://github.com/mentor-forge/mentorhub_customer_spa/issues/19) ("Bump spa_utils to latest release (1.0.3) — replace any use of token.name with token.display_name"). This task delivers **the pin and any local token-claim source/type/doc alignment**. Cypress Token-tab / chrome assertions and packaging are **F011**.

**External prerequisite**: `mentorhub_spa_utils` F047–F049 shipped and **`@mentor-forge/mentorhub_spa_utils@1.0.3` is published to CodeArtifact**. Vue `base` + SPA nginx prefix `/customer/` and the 1.0.1 catalog / `/customer/config` Settings host are already shipped (F003–F009). Run `mh`, then `npm view @mentor-forge/mentorhub_spa_utils version`. If **1.0.3** is not available, set this task **Status** to `Blocked`, rename the file to `BLOCKED.F010.pin_spa_utils_1_0_3.md`, and stop — do not stay on `1.0.2` and do not point `package.json` at a git URL or sibling path.

This SPA **owns this repo’s pin**. Sibling SPAs pin independently; do not change other repos.

**Token vs document `name`:** Customer `name`, Profile `name`, Event `name`, enumerator `name`, and collection `name` are **not** the authenticated token display claim. Only JWT / `/customer/api/config` `token` display-field usage that still says `name` becomes `display_name`.

**Out of scope**: Cypress catalog, Token-tab, or chrome specs (F011). Do not pass `navItems`, ALB origins, or role tables into `PageFrame`. Do not override logout locally. Do not add a local `display_name ?? name` shim. Do not fork `TokenClaimsCard` or `PageFrame` chrome. Do not add, rename, or delete routes.

### Wave ordering

Pin + local token-claim alignment (F010) → Cypress `display_name` coverage and packaging (F011). Pinning first makes 1.0.3 `PageFrame` chrome and `TokenClaimsCard` `display_name` available before F011 asserts them in the browser.

## Goals

- `package.json` pins `"@mentor-forge/mentorhub_spa_utils": "1.0.3"` — exact semver, **no caret**.
- `package-lock.json` resolves `1.0.3` from the CodeArtifact registry after `mh` and `npm install --include=dev`.
- `npm ls @mentor-forge/mentorhub_spa_utils` reports `1.0.3`.
- There are zero local reads of token `name` in SPA source, unit tests, or README where the value is meant to come from the authenticated token / `/customer/api/config` token contract. Remaining `name` hits are document or enumerator fields.
- If `ConfigResponse.token` (or unit fixtures that model that payload) still encode a token display field as `name`, change it to `display_name`. Do not invent a nested-vs-flat compatibility layer; keep the existing `AdminPage` pass-through of `config.token`.
- The app still builds and unit-tests: `PageFrame` still receives only `pageTitle` (`page-title="Customer"`). Keep `provideEditorConfig`. IdP bootstrap / `urlAuthBootstrap` / `redirectToIdpLogin` stay as today. Logout `return_to` remains owned by spa_utils — do not add a local logout handler and do not re-introduce `handleLogout`.
- `README.md` names the pinned version **1.0.3**. Document that Token-tab `display_name` (`admin-token-display-name-display`) and PageFrame chrome `nav-profile-name-display` are owned by spa_utils 1.0.3. Do not invent a local display-name mapping.
- Fix any `src/**` import or type breakage from 1.0.3. Do not add, rename, or delete routes. Keep existing detail/edit/create pages and the existing `/config` AdminPage wrapper.
- `vitest.config.ts` may be touched **only** if 1.0.3 changes whether the package must be inlined for Vitest. Do not change coverage thresholds.
- The three spa_utils Cypress subpath imports still resolve under 1.0.3: `cypress/jwtDefaults`, `cypress/registerJwtSignTask`, and `cypress/registerAuthCommands`. If a subpath or option name moved, update the import here — do **not** vendor a local copy. Do not rewrite `navigation.cy.ts` Token or chrome expectations here.

### Craftsmanship Expectations

- Reuse `mentorhub_spa_utils` for shared SPA behavior rather than creating local equivalents.
- Treat DRY as avoiding duplicated knowledge: Token-tab fields and avatar chrome are owned by 1.0.3 `TokenClaimsCard` / `PageFrame`. Do not grow a parallel Token UI.
- Keep journey-specific behavior in this SPA (customer home, profile, JWT `customer_id` / `profile_id` readers). Identify a spa_utils harvest only if a second journey already needs the same helper; do not add `getStoredDisplayName` locally.
- Prefer deleting obsolete local behavior when responsibility has moved to spa_utils. Do not introduce local workarounds that accept both token `name` and `display_name`. Prefer proving no production-code change is needed over speculative typing churn.

## Testing Expectations

Run all commands from **this SPA repository root**.

- `mh` (CodeArtifact auth) then `npm install --include=dev`
- `npm ls @mentor-forge/mentorhub_spa_utils` — confirm **1.0.3**
- Confirmation searches:
  - `rg 'token\.name|token\[.name.\]|token\.get\(.name.\)' src README.md`
  - `rg 'display_name' src README.md`
  - Review remaining `name` hits in `src` and prove they are Customer / Profile / Event / enumerator / collection fields, not token display claims
- `npm run test` — full Vitest suite
- `npm run test:coverage` — the `src/api/**`, `src/composables/**`, and `src/components/**` thresholds in `vitest.config.ts` must still hold
- `npm run build` — `vue-tsc` must be clean. **This repo defines no `lint` script**, so `npm run build` is the type gate. Do not add a lint script in this task.

Do **not** run `npm run cypress:run` in this task. Existing Cypress Token stubs omit `display_name` and do not assert `admin-token-display-name-display` or `nav-profile-name-display`. Leave those specs to F011. Do not “fix” them here unless a unit test or `vue-tsc` fails.

Packaging (`npm run container` / `npm run service`) is **F011**.

## Outputs

Paths are relative to **this SPA repository root**.

**Update:**

- `package.json` — `"@mentor-forge/mentorhub_spa_utils": "1.0.3"`
- `package-lock.json` — resolved 1.0.3 from CodeArtifact
- `README.md` — spa_utils version note **1.0.3**; Token / chrome `display_name` ownership (`admin-token-display-name-display`, `nav-profile-name-display`); keep the existing `/customer/config` Settings-host wording
- `src/api/types.ts` — only if token typing should include `display_name` (do not add a `name` alias)
- `src/api/types.test.ts` / `src/api/client.test.ts` — only if token fixtures modeled a display claim as `name`
- `src/composables/useAuth.ts` / `src/composables/useAuth.test.ts` / `src/composables/useConfig.ts` / `src/composables/useConfig.test.ts` / `src/composables/useRoles.ts` / `src/composables/useRoles.test.ts` — only if they read a token display field
- `vitest.config.ts` — only if 1.0.3 requires a change to the inline setting
- `cypress.config.ts`, `cypress/support/e2e.ts` — only if a spa_utils Cypress subpath or option moved in 1.0.3
- Any `src/**` import or type that fails to compile against 1.0.3

Do not change the `/config` route. Do not pass disallowed `PageFrame` props. Do not change Cypress specs in this task unless a compile of test helpers breaks. Do not change `src/router/index.ts`, `vite.config.ts`, `nginx.conf.template`, or `Dockerfile`. Do not rename Customer / Profile / Event `name` fields.

## Execution Notes

**Plan**
1. Confirm `@mentor-forge/mentorhub_spa_utils@1.0.3` is published (`mh`, then `npm view`). If missing, Blocked and stop.
2. Pin `package.json` to exact `1.0.3` (no caret). `npm install --include=dev` and confirm lockfile + `npm ls`.
3. Local token-claim audit: no `token.name` reads in `src` / README. Remaining `name` hits are Customer / Profile / Event / enumerator / collection / route names. `ConfigResponse.token` is `{ claims?: Record<string, unknown> }` with no display field; `useAuth` only reads `customer_id` / `profile_id`. Do not add a local mapper or speculative `display_name` type unless 1.0.3 compile requires it.
4. Update `README.md` to pin **1.0.3** and document spa_utils ownership of Token-tab `display_name` (`admin-token-display-name-display`) and PageFrame chrome (`nav-profile-name-display`). Keep `/customer/config` Settings-host wording.
5. After install, verify Cypress subpaths (`cypress/jwtDefaults`, `cypress/registerJwtSignTask`, `cypress/registerAuthCommands`) still resolve. Touch `cypress.config.ts` / `cypress/support/e2e.ts` only if a subpath moved. Touch `vitest.config.ts` only if inline setting must change.
6. Run `npm run test`, `npm run test:coverage`, `npm run build`. Confirmation `rg` searches. Do not run Cypress or packaging (F011).

**Results**
- Branch: `F-CS14-TokenUpdate` (unchanged).
- CodeArtifact: `mh` then `npm view @mentor-forge/mentorhub_spa_utils version` → **1.0.3** (published; not Blocked).
- Pin: `package.json` exact `"1.0.3"` (no caret). `npm install --include=dev`. `npm ls` → `@mentor-forge/mentorhub_spa_utils@1.0.3`. Lockfile resolved from CodeArtifact (`mentorhub_spa_utils-1.0.3.tgz`).
- Token-claim audit: `rg 'token\.name|token\[.name.\]|token\.get\(.name.\)' src README.md` → **zero hits**. `display_name` appears only in README ownership notes (spa_utils Token tab + PageFrame chrome). Remaining `src` `name` hits are Customer / Profile / Event document fields, enumerator / collection names, Vue route names, `ApiError.name`, and `headers.get(name)` — not the JWT display claim.
- Production types/composables unchanged: `ConfigResponse.token` stays `{ claims?: Record<string, unknown> }` (already admits `display_name`; no `name` alias). `useAuth` still only reads `customer_id` / `profile_id`. No local mapper. `AdminPage` still pass-through of `config`. `PageFrame` still `page-title="Customer"` only. Cypress subpaths unchanged in 1.0.3. `vitest.config.ts` inline setting unchanged.
- README: pin **1.0.3**; Token-tab `admin-token-display-name-display` and chrome `nav-profile-name-display` owned by spa_utils; `/customer/config` Settings-host wording kept.
- `src/api/client.test.ts`: added 204 / non-JSON error cases so `src/api/**` branch coverage meets the existing 75% threshold (pre-existing gap on `request()` empty-body and JSON-parse catch; not a token `name` fixture). Token fixture remains `{ claims: {} }`.
- Tests: `npm run test` — 38 passed (9 files). `npm run test:coverage` — api 100% stmts/branch/funcs/lines; composables above thresholds; no threshold change. `npm run build` — `vue-tsc` clean, Vite production build succeeded. No `lint` script in this repo. Cypress and packaging left to F011.
