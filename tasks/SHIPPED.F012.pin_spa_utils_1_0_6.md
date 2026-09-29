# F012 – Pin `@mentor-forge/mentorhub_spa_utils@1.0.6` (CardGrid removal, DataCardGrid, MarkdownEditor)

**Status**: Shipped  
**Type**: Feature  
**Depends On**: _(none — first task in this wave)_  
**Description**: This repo owns the Customer SPA **1.0.6 pin**. Bump `@mentor-forge/mentorhub_spa_utils` from exact `1.0.5` to exact **`1.0.6`**, refresh the lockfile from CodeArtifact, and align this SPA with the shipped 1.0.6 card and markdown contract. Package `CardGrid` is removed. Do not reintroduce list card dashboards. Do not add `marked` or `dompurify`. Cypress and packaging are **F013**.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md` — exact semver pins for shared packages; CodeArtifact (`mh` then `npm install`)
- `../mentorhub_spa_utils/README.md` — install pin **1.0.6**; **MhCard / DataCard / DataCardGrid**; **Type-aligned editors** (`markdown` / `MarkdownEditor`). Shared list `CardGrid` left the package in 1.0.6. List card dashboards belong to Discovery. `DataCardGrid` is a no-prop CSS Grid slot wrapper (`class="data-card-grid"`, hardcoded `data-automation-id="data-card-grid"`): 1 column below 641px, 2 from 641px, 4 from 1920px, 16px gap. It is not a Fragment flattener. `MarkdownEditor` props are unchanged (`field`, `modelValue`, `onSave`, `editable`, `visible`, `automationId`, `label`, `hint`, `rules`, `rows`). Resting view is sanitized GFM HTML (`marked` + `dompurify` bundled in spa_utils). Editable fields enter the textarea on click or Enter. Automation ids: root `automationId`, textarea `${automationId}-input`, display `${automationId}-display`, value `markdown-field-display`. Package-root import pulls component CSS.
- `README.md` — currently documents spa_utils **1.0.5** (ownership table, PageFrame, Token tab, Testing, Automation Support). Components note already prefers `DataCard` + typed editors and keeps `AutoSaveField` for legacy pages.
- `tasks/_ORCHESTRATE.md`
- `tasks/_PLANNING.md`
- `package.json` / `package-lock.json` — currently `"@mentor-forge/mentorhub_spa_utils": "1.0.5"`; no `marked` or `dompurify`
- `src/App.vue` — `PageFrame` with `page-title="Customer"` only plus `provideEditorConfig` (keep; do not add `navItems`, ALB URLs, or role tables)
- `src/pages/AdminPage.vue` — already imports `{ AdminPage }` from spa_utils and passes `GET /customer/api/config` (do not fork Token / Config locally)
- `src/pages/CustomerEditPage.vue` — one readonly `v-card` (name, description `v-textarea`, status). Not a list dashboard. Not several cards.
- `src/pages/ProfilePage.vue` — one `v-card`. `display_name` and `description` are spa_utils `AutoSaveField` (`description` uses `textarea`, `validationRules.descriptionPattern`, max 255, no tabs or newlines). Status is a readonly `v-text-field`. Not `MarkdownEditor`.
- `src/main.ts` — no spa_utils stylesheet import; root imports in other modules already pull package CSS for Vite
- `vitest.config.ts` — inlines `@mentor-forge/mentorhub_spa_utils`; no version comment to update unless 1.0.6 changes the inline setting
- `cypress.config.ts` / `cypress/support/e2e.ts` — spa_utils Cypress subpaths `cypress/jwtDefaults`, `cypress/registerJwtSignTask`, `cypress/registerAuthCommands`

**Source issue**: first `mentorhub_customer_spa` issue in the spa_utils **1.0.6** wave. This task delivers **the pin and local source/doc alignment**. Cypress markdown interaction and packaging are **F013**.

**External prerequisite**: `mentorhub_spa_utils` F050–F056 shipped and **`@mentor-forge/mentorhub_spa_utils@1.0.6` is published to CodeArtifact**. Vue `base` + SPA nginx prefix `/customer/` and the catalog / `/customer/config` Settings host are already shipped. Run `mh`, then `npm view @mentor-forge/mentorhub_spa_utils version`. If **1.0.6** is not available, set this task **Status** to `Blocked`, rename the file to `BLOCKED.F012.pin_spa_utils_1_0_6.md`, and stop — do not stay on `1.0.5` and do not point `package.json` at a git URL or sibling path.

This SPA **owns this repo’s pin**. Sibling SPAs pin independently; do not change other repos.

**Survey (planning time — reconfirm, do not assume a later edit added imports):**

- Zero imports of `CardGrid` from `@mentor-forge/mentorhub_spa_utils`. There is no local `CardGrid` component.
- Zero imports of `DataCard`, `DataCardGrid`, `MhCard`, or `MarkdownEditor`. There are no local copies of those components to delete.
- `CustomerEditPage` and `ProfilePage` are each a single card. Neither lays out several edit/detail cards. Collections stay on Discovery. `/` and `/profile/` stay detail/edit. `/config` stays the packaged `AdminPage` host.
- Profile description is an always-visible `AutoSaveField` textarea (`profile-view-description-input`). Customer description is a readonly `v-textarea` (`customer-edit-description-input`). Neither is `MarkdownEditor`. Leave Cypress for F013.

**Out of scope**: Cypress specs (F013). Do not pass `navItems`, ALB origins, or role tables into `PageFrame`. Do not override logout locally. Do not fork `AdminPage`, `TokenClaimsCard`, or `PageFrame`. Do not rename, redirect, or delete `/`, `/profile/`, or `/config`. Do not convert profile `description` from `AutoSaveField` to `MarkdownEditor`. Do not convert the customer readonly description into markdown. Do not add a collection dashboard. Do not split a single card into several cards so this SPA has something to put in `DataCardGrid`.

### Wave ordering

Pin + local 1.0.6 alignment (F012) → Cypress confirmation and packaging (F013). Pinning first makes 1.0.6 `MarkdownEditor` resting view and `DataCardGrid` available before F013 checks selectors.

## Goals

- `package.json` pins `"@mentor-forge/mentorhub_spa_utils": "1.0.6"` — exact semver, **no caret**.
- `package-lock.json` resolves `1.0.6` from the CodeArtifact registry after `mh` and `npm install --include=dev`.
- `npm ls @mentor-forge/mentorhub_spa_utils` reports `1.0.6`.
- `package.json` does **not** gain `marked` or `dompurify` (or any other markdown renderer). Those libraries stay bundled inside spa_utils.
- There are zero imports of `CardGrid` from `@mentor-forge/mentorhub_spa_utils`. If a later edit added one, delete that import and the layout that depended on it. Do not replace it with a list card dashboard.
- Customer home and profile remain single-card detail/edit pages. `ProfilePage` stays on `AutoSaveField` for `display_name` and `description` (sentence-style description rules, not markdown). `CustomerEditPage` stays readonly fields on one `v-card`. Do not wrap either page in `DataCard` or `DataCardGrid`.
- Do not add a local multi-card page just to consume `DataCardGrid`. This SPA has no page that lays out several edit/detail cards. `/customer/config` continues to render packaged `AdminPage`. If implementation discovers a local page that already lays out several edit/detail cards with ad-hoc markup, replace that layout with package `DataCardGrid` + `DataCard` (no props on the grid; children authored in the slot; root class `data-card-grid`; hardcoded `data-automation-id="data-card-grid"`). Do not pass breakpoint props. Do not flatten Fragments. Do not use it as a list dashboard.
- Do not add a `MarkdownEditor` consumer. Existing description fields stay `AutoSaveField` textarea (profile) or readonly `v-textarea` (customer). If a compile fix must touch an editor import, keep the same props. Do not install `marked` or `dompurify` to render markdown locally.
- The app still builds and unit-tests: `PageFrame` still receives only `pageTitle` (`page-title="Customer"`). Keep `provideEditorConfig`. IdP bootstrap / `urlAuthBootstrap` / `redirectToIdpLogin` stay as today. Logout `return_to` remains owned by spa_utils.
- `README.md` names the pinned version **1.0.6**. Keep existing `/customer/config` vs detail-page wording and the 1.0.5 Token / chrome `display_name` facts (`unknown` when the claim is missing), updated to say they are owned by spa_utils **1.0.6**. State that package `CardGrid` is gone, list collections stay on Discovery, multi-card edit/detail would use package `DataCardGrid` / `DataCard` (this SPA has none — each detail page is one card), and `MarkdownEditor` resting view is owned by spa_utils (this SPA does not depend on `marked` or `dompurify` and does not host a markdown field).
- Fix any `src/**` import or type breakage from 1.0.6. Do not add, rename, or delete routes. Keep existing `/`, `/profile/`, and `/config` pages and the existing `AdminPage` wrapper.
- `vitest.config.ts` may be touched **only** if 1.0.6 changes whether the package must be inlined for Vitest. Do not change coverage thresholds.
- The three spa_utils Cypress subpath imports still resolve under 1.0.6. If a subpath or option name moved, update the import here — do **not** vendor a local copy. Do not rewrite Cypress specs here.

### Craftsmanship Expectations

- Reuse `mentorhub_spa_utils` for shared SPA behavior rather than creating local equivalents.
- Treat DRY as avoiding duplicated knowledge: card chrome and markdown rendering are owned by 1.0.6 `DataCard` / `DataCardGrid` / `MarkdownEditor`. Do not grow a local card grid or a local markdown renderer.
- Keep journey-specific behavior in this SPA (customer detail, profile edit, JWT `customer_id` / `profile_id` readers).
- Prefer deleting a `CardGrid` import over replacing it. Do not invent a list dashboard because the export disappeared.
- Do not introduce local workarounds that reimplement `DataCardGrid` columns or sanitize markdown in this repo.
- Do not widen profile `description` from the sentence-style `AutoSaveField` contract (max 255, no tabs or newlines) into markdown (max 4096, rendered GFM) just to exercise the new editor.

## Testing Expectations

Run all commands from **this SPA repository root**.

- `mh` (CodeArtifact auth) then `npm install --include=dev`
- `npm ls @mentor-forge/mentorhub_spa_utils` — confirm **1.0.6**
- Confirmation searches:
  - `rg 'CardGrid' src cypress package.json README.md` — zero component imports; README may mention the removal
  - `rg 'marked|dompurify' package.json package-lock.json src` — zero direct dependencies (lockfile hits only inside the spa_utils tarball are acceptable)
  - `rg 'MarkdownEditor|DataCardGrid|DataCard' src` — zero, unless a pre-existing multi-card page was migrated in this task
  - `rg "from '@mentor-forge/mentorhub_spa_utils'" src cypress.config.ts cypress/support` — every import still resolves
- `npm run test` — full Vitest suite
- `npm run test:coverage` — the `src/api/**`, `src/composables/**`, and `src/components/**` thresholds in `vitest.config.ts` must still hold
- `npm run build` — `vue-tsc` + Vite production build must be clean. **This repo defines no `lint` script**, so `npm run build` is the type gate. Do not add a lint script in this task.

Do **not** run `npm run cypress:run` in this task. Leave selector checks and packaging to F013. Do not “fix” Cypress here unless a Cypress helper import fails to compile.

Packaging (`npm run container` / `npm run service`) is **F013**.

## Outputs

Paths are relative to **this SPA repository root**.

**Update:**

- `package.json` — `"@mentor-forge/mentorhub_spa_utils": "1.0.6"`; do not add `marked` or `dompurify`
- `package-lock.json` — resolved 1.0.6 from CodeArtifact
- `README.md` — spa_utils version note **1.0.6**; CardGrid removed; collections stay on Discovery; `DataCardGrid` / `DataCard` contract for multi-card edit/detail (none in this SPA; customer and profile are each one card); `MarkdownEditor` resting view owned by spa_utils; keep existing `/customer/config` vs detail-page wording and Token / chrome `display_name` ids

**Update only if 1.0.6 breaks compile or a `CardGrid` import is found:**

- Any `src/**` file that imported `CardGrid` — delete the import and the dependent layout; do not add a list dashboard
- Any local page that already lays out several edit/detail cards — switch that layout to package `DataCardGrid` + `DataCard`
- `vitest.config.ts` — only if 1.0.6 requires a change to the inline setting
- `cypress.config.ts`, `cypress/support/e2e.ts` — only if a spa_utils Cypress subpath or option moved in 1.0.6
- Any other `src/**` import or type that fails to compile against 1.0.6

Do not change the `/`, `/profile/`, or `/config` routes. Do not pass disallowed `PageFrame` props. Do not change Cypress specs in this task unless a compile of test helpers breaks. Do not change `src/router/index.ts`, `vite.config.ts`, `nginx.conf.template`, or `Dockerfile`. Do not change `ProfilePage` editor types or `CustomerEditPage` field widgets. Do not rename profile or customer fields. Do not add `src/main.ts` stylesheet import unless the production build proves package CSS is missing.

## Execution Notes

### Plan
1. Confirm `@mentor-forge/mentorhub_spa_utils@1.0.6` is published to CodeArtifact (`mh` + `npm view`).
2. Pin `package.json` to exact `1.0.6` (no caret); refresh lockfile via `npm install --include=dev`.
3. Update `README.md` version notes for 1.0.6 (CardGrid removed; Discovery owns collections; DataCardGrid/DataCard contract; MarkdownEditor owned by spa_utils; Token/chrome display_name facts retained).
4. Reconfirm survey: no CardGrid / DataCard / DataCardGrid / MarkdownEditor consumers; no src layout migration needed.
5. Run confirmation searches + `npm run test` / `test:coverage` / `build`. Leave Cypress and packaging to F013.

### Commands and results
- `mh` — CodeArtifact auth refreshed
- `npm view @mentor-forge/mentorhub_spa_utils version` → **1.0.6** (available; not blocked)
- `npm install --include=dev` — added 3 packages, changed 1 package
- `npm ls @mentor-forge/mentorhub_spa_utils` → `@mentor-forge/mentorhub_spa_utils@1.0.6`
- Confirmation searches:
  - `CardGrid` in `src` / `cypress` / `package.json`: **zero**; README mentions removal only
  - `marked|dompurify` in `package.json` / `src`: **zero**; lockfile hits only as spa_utils transitive deps
  - `MarkdownEditor|DataCardGrid|DataCard` in `src`: **zero**
  - spa_utils imports in `src` / Cypress helpers: all resolve; Cypress subpaths `jwtDefaults`, `registerJwtSignTask`, `registerAuthCommands` still exported by 1.0.6
- `npm run test` — **pass** (9 files, 39 tests)
- `npm run test:coverage` — **pass** (thresholds held; api 100%; composables stmts/lines 96.32%, funcs 100%)
- `npm run build` — **pass** (`vue-tsc` + Vite production build clean)

### Files changed
- `package.json` — pin `"@mentor-forge/mentorhub_spa_utils": "1.0.6"`
- `package-lock.json` — resolved 1.0.6 from CodeArtifact
- `README.md` — version / CardGrid / DataCardGrid / MarkdownEditor notes for 1.0.6
- `tasks/PENDING.F012.pin_spa_utils_1_0_6.md` — these Execution Notes

### Intentionally not changed
- No `src/**`, `vitest.config.ts`, Cypress specs/helpers, routes, `ProfilePage` / `CustomerEditPage` editors, `marked`/`dompurify` direct deps, lint script, container/service, or F013 work. Status left **Pending** (orchestrator commits / SHIPPED rename).
