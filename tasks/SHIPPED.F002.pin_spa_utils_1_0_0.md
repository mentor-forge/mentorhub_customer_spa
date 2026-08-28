# F002 – Pin `@mentor-forge/mentorhub_spa_utils@1.0.0`

**Status**: Complete  
**Type**: Feature  
**Depends On**: `F001_retire_list_dashboards`  
**Description**: This repo owns the Customer SPA **1.0.0 pin** (issue F-CS12). Move `@mentor-forge/mentorhub_spa_utils` from `0.2.2` to an exact **`1.0.0`** pin, refresh the lockfile from CodeArtifact, and fix any residual compile or test breakage from APIs removed in 1.0.0. Do not adopt `PageFrame` (F003), do not change routes, and do not touch the `/customer/` base path (F004–F005) in this task.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md` — SPA dependency management (exact pins for shared packages)
- `../mentorhub_spa_utils/README.md` — install pin **1.0.0**; **Removed in 1.0.0**: `useInfiniteScroll`, `InfiniteScrollResponse`, `InfiniteScrollParams`, `UseInfiniteScrollOptions`; cursor fields `after_id` / `limit` / `has_more` / `next_cursor` must not appear in SPA ↔ API contracts; `AutoSaveSelect` is legacy in favor of `EnumEditor` / `EnumArrayEditor`
- `README.md` — currently documents the 0.2.x component set
- `tasks/_ORCHESTRATE.md`
- `tasks/_PLANNING.md`
- `tasks/PENDING.F001.retire_list_dashboards.md` — wave-ordering rationale (why removal precedes this pin)
- `package.json` / `package-lock.json` — currently `"@mentor-forge/mentorhub_spa_utils": "0.2.2"`
- `src/composables/useAuth.ts`, `src/composables/useRoles.ts`, `src/composables/useConfig.ts`, `src/api/client.ts`, `src/pages/AdminPage.vue`, `src/pages/CustomerEditPage.vue`, `src/pages/ProfilePage.vue`, `src/pages/*EditPage.vue`, `src/pages/*NewPage.vue`, `src/App.vue`, `src/router/index.ts`, `cypress.config.ts` — current spa_utils consumers
- `cypress.config.ts` — imports `@mentor-forge/mentorhub_spa_utils/cypress/jwtDefaults` and `.../cypress/registerJwtSignTask`; confirm both subpaths still exist in 1.0.0

**External prerequisite**: `@mentor-forge/mentorhub_spa_utils@1.0.0` must be **published to CodeArtifact**. Run `mh`, then `npm view @mentor-forge/mentorhub_spa_utils version`. If **1.0.0** is not available, set this task **Status** to `Blocked`, rename the file to `BLOCKED.F002.pin_spa_utils_1_0_0.md`, and stop — do not stay on `0.2.2`, do not use a caret range, and do not point `package.json` at a git URL.

F001 already deleted every `useInfiniteScroll` consumer and the cursor-based API surface, so this pin is expected to be a clean version bump. If something still fails to compile, fix it here rather than deferring it into F003.

## Goals

- `package.json` pins `"@mentor-forge/mentorhub_spa_utils": "1.0.0"` (exact semver, no caret).
- `package-lock.json` resolves `1.0.0` from the CodeArtifact registry after `mh` and `npm install --include=dev`.
- `npm ls @mentor-forge/mentorhub_spa_utils` reports `1.0.0`.
- No source, test, or Cypress file imports `useInfiniteScroll` or any `InfiniteScroll*` type, and no SPA ↔ API contract in `src/api/**` uses `after_id`, `limit`, `has_more`, or `next_cursor` (grep confirms; F001 removed them).
- `cypress.config.ts` still resolves the spa_utils Cypress subpath imports under 1.0.0. If either subpath moved, update the import path here — do not vendor a local copy of the JWT sign task.
- Existing behavior is unchanged: `initAuth` / `bootstrapAuthFromUrl`, router guards with `useAuth` / `hasStoredRole` / `redirectToIdpLogin`, the `/api/config` startup fetch in `useConfig`, the `/config` AdminPage wrapper, and the local app bar / drawer / logout in `src/App.vue` all behave exactly as they do after F001.
- Any page still using `AutoSaveSelect` for a fixed `items` array keeps working (1.0.0 keeps it as legacy). Do **not** migrate enum fields to `EnumEditor` in this task — that requires `provideEditorConfig`, which lands in F003.
- `README.md` names the pinned version **1.0.0** and drops references to removed infinite-scroll helpers.
- Do **not** wrap `PageFrame`, do **not** add `provideEditorConfig`, and do **not** change `vite.config.ts`, `src/router/index.ts`, `nginx.conf.template`, `Dockerfile`, or `src/api/client.ts`.

## Testing Expectations

Run all commands from **this SPA repository root**.

- `mh` (CodeArtifact auth) then `npm install --include=dev`
- `npm ls @mentor-forge/mentorhub_spa_utils` — confirm `1.0.0`
- `npm run test`
- `npm run build` — `vue-tsc` is the type gate (this repo defines no `lint` script)

**Packaging verification:**

- `npm run container` — build the SPA container image

## Outputs

Paths are relative to **this SPA repository root**.

**Update:**

- `package.json` — exact `1.0.0` pin
- `package-lock.json` — resolved `1.0.0` from CodeArtifact
- `vitest.config.ts` — server.deps.inline for spa_utils 1.0.0
- `README.md` — spa_utils version note and component list

## Execution Notes

1. Updated `package.json` to exact pin `"@mentor-forge/mentorhub_spa_utils": "1.0.0"`.
2. Executed `npm install --include=dev`, verified `npm ls @mentor-forge/mentorhub_spa_utils` returns `1.0.0`.
3. Updated `vitest.config.ts` with `server.deps.inline: ['@mentor-forge/mentorhub_spa_utils']` to handle package CSS imports.
4. Ran `npm run test:coverage` (14/14 test files passing, lines >=97%, branch >=73%, funcs 100%).
5. Ran `npm run build` (`vue-tsc && vite build`) successfully with no errors.
6. Ran `npm run container` (`docker-build.sh`) successfully.

