# F011 – 1.0.3 `display_name` Cypress and packaging

**Status**: Shipped  
**Type**: Feature  
**Depends On**: `F010_pin_spa_utils_1_0_3`  
**Description**: Point Cypress at spa_utils **1.0.3** Token-tab and PageFrame `display_name` behavior, keep existing 1.0.1 catalog / `/customer/config` host coverage, and run the packaged SPA as the acceptance gate for [F-CS14 / GitHub #19](https://github.com/mentor-forge/mentorhub_customer_spa/issues/19).

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md` — E2E covers pages; automation ids are a stable UI API
- `../mentorhub_spa_utils/README.md` — Token tab `display_name` → `admin-token-display-name-display`; PageFrame chrome `nav-profile-name-display` inside `nav-profile-link` when JWT `display_name` is present and non-blank; **no** fallback to `name` / `given_name` / `email` / `user_id` / `sub`; missing Token-tab strings render `N/A`. Live Developer Edition / `signCypressJwt` tokens may still omit `display_name` — stub intercepts / JWT payload in Cypress rather than synthesizing claims in app code
- `README.md` — after F010 should name spa_utils **1.0.3**; Automation Support may still omit Token `display_name` ids
- `tasks/_ORCHESTRATE.md`
- `tasks/_PLANNING.md`
- `tasks/PENDING.F010.pin_spa_utils_1_0_3.md` (or shipped successor) — pin and local token-claim alignment already done; use Execution Notes if types/fixtures changed
- `cypress.config.ts` — `baseUrl` stays `http://localhost:8388`
- `cypress/support/e2e.ts` — `registerAuthCommands({ visitPath: '/customer/' })`
- `cypress/support/commands.ts` — `visitPrefixed` only; spa_utils demo `stubJwtDisplayName` is **not** a packaged export — do not copy the demo helper into this repo unless a tiny inline JWT patch in a spec is required
- `cypress/e2e/navigation.cy.ts` — `adminConfigBody.token` currently has `profile_id` / `customer_id` / `mentor_id` only; Token tab asserts those three ids; chrome asserts `nav-profile-link` but not `nav-profile-name-display`
- `cypress/e2e/customer.cy.ts`, `cypress/e2e/profile.cy.ts` — prefixed detail coverage; keep (document `name` is not the token display claim)
- `cypress/e2e/deployment.cy.ts` — nginx prefix / API proxy; keep unless a selector breaks
- `src/pages/AdminPage.vue` — packaged `AdminPage` pass-through of `config.token`

Cypress runs against **8388**. Collection hamburger `href`s from `buildJourneyUrl` still include **`:8080`**. **Settings is the exception:** `hostingConfigHref()` stays on the current origin (`http://localhost:8388/customer/config`).

`npm run dev` and `npm run service` both bind host port **8388**. Cypress runs against `npm run service`.

**Do not** change the spa_utils pin in this task. Do not add a local Home or weaken `requiresRole` to make chrome easier to screenshot.

## Goals

- **Token tab (present):** after admin Settings navigation, stub `GET **/customer/api/config` with a `token` object that includes `display_name` plus the existing `profile_id`, `customer_id`, and `mentor_id`. Open `admin-tab-token` and assert `admin-token-display-name-display` (read-only input value) **and** the three existing id displays. Do not assert a token `name` field.
- **Token tab (missing):** a second intercept whose token omits `display_name` (and does not supply `name` / `given_name` / `email` as a substitute) must show `N/A` on `admin-token-display-name-display`. This is the failure mode that would look correct if spa_utils still mapped `name` → display.
- **PageFrame chrome:** default `cy.login(['customer'])` / `cy.login(['admin'])` may remain compact (no `nav-profile-name-display`) because `signCypressJwt` omits the claim. If this SPA asserts chrome `display_name`, patch the stored JWT payload in the spec (or a one-off command) and reload — do not add app-code fallbacks and do not vendor spa_utils demo `commands.ts`. When the claim is stubbed, `nav-profile-name-display` inside `nav-profile-link` shows the stubbed name. When it is absent, that node is omitted.
- Existing F009 coverage still passes: 1.0.1 catalog (customer vs admin), Settings `href` on hosting `/customer/config` (not `:8080`, not `/admin/settings`), Events/Home/Notifications on welcome `:8080`, removed Products/Customer/Members ids, admin-only Notifications/Settings, non-admin `/customer/config` gate, logout `return_to=http://localhost:8080/discovery/`.
- `customer.cy.ts`, `profile.cy.ts`, and `deployment.cy.ts` still pass; touch them only if a 1.0.3 selector breaks. Do not rename Profile / Customer document `name` assertions.
- `README.md` Testing / Automation Support lists Token-tab `admin-token-display-name-display` and chrome `nav-profile-name-display` as spa_utils 1.0.3 ids this host asserts (not local `nav-*` ids).
- No local Token UI. No `/customer/customer` in `cy.url()` or `href`.

### Craftsmanship Expectations

- Use spa_utils PageFrame / TokenClaimsCard automation ids; do not invent a local Token card.
- Assert `display_name` at the layer that owns it: config intercept → Token tab; JWT localStorage → chrome. A test that only checks final text without the stubbed source would miss a leftover `token.name` mapping.
- Do not restore Products / Customer / Members hamburger rows. Do not add an Events list route.
- Prefer extending `navigation.cy.ts` over adding a new spec file unless the file becomes unreadable.

## Testing Expectations

Run all commands from **this SPA repository root**.

- Confirmation searches:
  - `rg 'token\.name|token\[.name.\]|token\.get\(.name.\)' src cypress README.md`
  - `rg 'display_name|admin-token-display-name-display|nav-profile-name-display' cypress README.md`
- `npm run test`
- `npm run test:coverage`
- `npm run build` — `vue-tsc` is the type gate (this repo defines no `lint` script; do not add one)

**Packaging verification** (required — last task of the F-CS14 / 1.0.3 set):

- `npm run container` — build the SPA container image
- `npm run service` — run db + API + SPA containers
- `npm run cypress:run` — headless end-to-end tests (long running); **all** specs must pass against `http://localhost:8388/customer/...`

Do not run `npm run dev` and `npm run service` at the same time — both bind host port **8388**.

Record results in **Execution Notes**. The gate that would look correct while bypassing the intended boundary is: Token tab populated from `name` / `given_name` / `email` while `display_name` is absent; chrome showing a fabricated name when the JWT claim is missing; or Token tab still omitting `admin-token-display-name-display` after the 1.0.3 pin.

Env notes from prior waves: `GITHUB_FOREVER_TOKEN` as `GITHUB_TOKEN` if the file token is denied by GHCR; `IDP_LOGIN_URI=http://127.0.0.1:8080/login.html` before `mh up` so logout specs do not hang on a Tailscale IdP host.

## Outputs

Paths are relative to **this SPA repository root**.

**Update:**

- `cypress/e2e/navigation.cy.ts` — config token stub includes `display_name`; Token tab present + missing (`N/A`) assertions; optional JWT chrome stub for `nav-profile-name-display`; keep existing catalog / Settings host / logout coverage
- `cypress/e2e/deployment.cy.ts` — only if a prefix assertion must mention Token ids
- `cypress/e2e/customer.cy.ts`, `cypress/e2e/profile.cy.ts` — only if a 1.0.3 selector breaks (document `name` stays document `name`)
- `cypress/support/commands.ts` / `cypress/support/e2e.ts` — only if a minimal JWT `display_name` stub is required and cannot live inline in the spec
- `cypress/fixtures/**` — only if Token/config intercepts need a fixture
- `README.md` — Testing / Automation Support 1.0.3 Token `display_name` and chrome ids

Do not restore a local drawer. Do not change the spa_utils pin. Do not add an Events route or list dashboards. Do not pass disallowed `PageFrame` props. Do not implement `display_name` fallbacks in `src/**`.

## Execution Notes

**Plan**
1. Keep spa_utils pin at exact **1.0.3**. Do not touch `src/**` or add `display_name` fallbacks.
2. Extend `cypress/e2e/navigation.cy.ts` (no new spec file):
   - Add `display_name` to the default `GET **/customer/api/config` token stub alongside existing `profile_id` / `customer_id` / `mentor_id`.
   - After Settings navigation (`nav-settings-link` → `/customer/config`), assert Token-tab `admin-token-display-name-display` input value **and** the three id displays. Do not assert a token `name` field.
   - Second intercept: omit `display_name`; include decoy `name` / `given_name` / `email` (the leftover-mapping failure mode) and assert `N/A` on `admin-token-display-name-display`.
   - Default `cy.login(['customer'])` chrome stays compact: `nav-profile-name-display` must not exist (`signCypressJwt` omits the claim).
   - Optional chrome present case: inline JWT payload patch + reload (do **not** vendor spa_utils demo `stubJwtDisplayName`). Intercept config so the unsigned patched JWT cannot 401 `loadConfig`. Assert `nav-profile-name-display` inside `nav-profile-link`.
3. Leave `customer.cy.ts`, `profile.cy.ts`, `deployment.cy.ts`, and Cypress support files untouched unless a 1.0.3 selector breaks.
4. README Testing / Automation Support: list Token-tab `admin-token-display-name-display` and chrome `nav-profile-name-display` as spa_utils **1.0.3** ids this host asserts.
5. Confirmation `rg` searches, then `npm run test`, `npm run test:coverage`, `npm run build`.
6. Packaging gate: `npm run container`, `npm run service` (with `IDP_LOGIN_URI=http://127.0.0.1:8080/login.html`; `GITHUB_FOREVER_TOKEN` as `GITHUB_TOKEN` if GHCR denies), then `npm run cypress:run` — all specs must pass against `http://localhost:8388/customer/...`.

### Summary (2026-09-03)

Extended Cypress against spa_utils **1.0.3** Token-tab and PageFrame `display_name` without changing the pin or adding local fallbacks. `GET **/customer/api/config` token stub now includes `display_name`; Token tab asserts `admin-token-display-name-display` plus the three ids. A second intercept omits `display_name` and supplies decoy `name` / `given_name` / `email` so leftover mapping would fail — UI shows `N/A`. Default login chrome stays compact; an inline JWT payload patch + reload asserts `nav-profile-name-display` inside `nav-profile-link`. README Testing / Automation Support lists those 1.0.3 ids as host-asserted. Packaging gate passed against `http://localhost:8388/customer/...`.

**Files changed**
- `cypress/e2e/navigation.cy.ts` — Token present + missing (`N/A` / decoys), compact chrome, stubbed JWT chrome
- `README.md` — Testing / Automation Support 1.0.3 Token and chrome ids
- this task file (plan, results, status)

**Unchanged**
- spa_utils pin remains exact `1.0.3`
- `customer.cy.ts`, `profile.cy.ts`, `deployment.cy.ts`, `commands.ts`, `e2e.ts`, fixtures, `src/**`

**Confirmation searches**
- `rg 'token\.name|token\[.name.\]|token\.get\(.name.\)' src cypress README.md` — zero hits
- `rg 'display_name|admin-token-display-name-display|nav-profile-name-display' cypress README.md` — `navigation.cy.ts` (stubs + assertions) and README docs only

**Test results**
- `npm run test` — 9 files / 38 tests passed
- `npm run test:coverage` — 38 passed; thresholds held (`src/api/**` 100/100/100/100; `src/composables/**` 96.32/67.74/100/96.32)
- `npm run build` — pass (`vue-tsc` + Vite production build; existing chunk-size warning and runtime-config.js module-attribute note only). No `lint` script in this repo.
- `npm run container` — pass; image `ghcr.io/mentor-forge/mentorhub_customer_spa:latest` (`sha256:00805959d0a9fa6b608b12bc609837e826c49d9f55a1cdc687340525068dec53`); Docker `JSONArgsRecommended` warning; npm install reported 7 audit vulnerabilities and install-script warnings during image build
- `npm run service` — pass; `mh down && mh up customer && npm run open` with `IDP_LOGIN_URI=http://127.0.0.1:8080/login.html` and `GITHUB_TOKEN` from `GITHUB_FOREVER_TOKEN`
- `npm run cypress:run` — pass against `http://localhost:8388`: `customer.cy.ts` 1/1, `deployment.cy.ts` 8/8, `navigation.cy.ts` 11/11, `profile.cy.ts` 3/3; **23/23 passing**, 0 failing

**Env workarounds**
- Exported `GITHUB_TOKEN` from `~/.mentorhub/GITHUB_FOREVER_TOKEN` before `npm run service`
- Set `IDP_LOGIN_URI=http://127.0.0.1:8080/login.html` before `mh up` so logout/IdP specs stay on the local Developer Edition IdP (runtime-config confirmed)

**Blockers**: none
