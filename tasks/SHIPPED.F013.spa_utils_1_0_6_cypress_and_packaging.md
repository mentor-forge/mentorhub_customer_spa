# F013 – 1.0.6 Cypress confirmation and packaging

**Status**: Shipped  
**Type**: Feature  
**Depends On**: `F012_pin_spa_utils_1_0_6`  
**Description**: Confirm Cypress still matches spa_utils **1.0.6** editor behavior, and run the packaged SPA as the acceptance gate for the Customer 1.0.6 pin. This SPA has no `MarkdownEditor` consumer. Do not invent one. Do not change the pin.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md` — E2E covers pages; automation ids are a stable UI API
- `../mentorhub_spa_utils/README.md` — `MarkdownEditor` resting view is sanitized rendered markdown. Editable fields enter the textarea on click or Enter. Textarea automation id is `${automationId}-input`; display is `${automationId}-display`; value node is `markdown-field-display`. `AutoSaveField` still renders its input or textarea while editable (it is not click-to-edit). `DataCardGrid` automation id is the hardcoded `data-card-grid`. `CardGrid` is gone.
- `README.md` — after F012 should name spa_utils **1.0.6**
- `tasks/_ORCHESTRATE.md`
- `tasks/_PLANNING.md`
- `tasks/PENDING.F012.pin_spa_utils_1_0_6.md` (or shipped successor) — pin already done; use Execution Notes if any local layout or import changed
- `cypress.config.ts` — `baseUrl` stays `http://localhost:8388`
- `cypress/support/e2e.ts` — `registerAuthCommands({ visitPath: '/customer/' })`
- `cypress/support/commands.ts` — `visitPrefixed` only
- `cypress/e2e/profile.cy.ts` — `/customer/profile/`. Description edits use `.find('textarea')` inside `profile-view-description-input`. That id is an `AutoSaveField` automation id (the component root already ends in `-input`). The textarea is visible without a prior click. Writes stay on a `customer` token whose `profile_id` matches the document; the mismatched-id case asserts API 403 without `admin`.
- `cypress/e2e/customer.cy.ts` — `/customer/`. Description is a readonly `v-textarea` (`customer-edit-description-input`); the spec reads `.find('textarea')` and does not type.
- `cypress/e2e/navigation.cy.ts` — Token tab and PageFrame chrome `display_name` coverage from the 1.0.3/1.0.5 wave; keep
- `cypress/e2e/deployment.cy.ts` — nginx prefix / API proxy; keep unless a selector breaks
- `src/pages/ProfilePage.vue` / `src/pages/CustomerEditPage.vue` — no `MarkdownEditor`
- `src/pages/AdminPage.vue` — packaged `AdminPage` pass-through

Cypress runs against **8388**. `npm run dev` and `npm run service` both bind host port **8388**. Cypress runs against `npm run service`.

**Customer SPA constraint:** `/config` requires `admin`. Profile writes must stay least-privilege (`customer` plus a matching `profile_id`). Do **not** seed `admin` for profile writes. Do **not** add a local Home or weaken `requiresRole`. Do **not** change the spa_utils pin in this task. Do **not** add `marked` or `dompurify`.

**Survey (planning time):** no Cypress spec types into a markdown textarea. `profile.cy.ts` types into an always-visible `AutoSaveField` textarea. `customer.cy.ts` only reads a readonly textarea. No spec targets `CardGrid` or `data-card-grid`. The click-or-Enter-then-`${automationId}-input` rule applies only if a spec is typing into `MarkdownEditor` without opening edit mode.

## Goals

- Reconfirm there is no Cypress use of `MarkdownEditor`, `CardGrid`, or `data-card-grid`. Do not add a markdown field, a card grid page, or a spec whose only purpose is to exercise the new resting view.
- If a spec **does** type into a markdown textarea that is hidden until edit mode, change it to activate the display first (click or Enter on `${automationId}-display`), then type into `${automationId}-input`. Do not type into the resting view.
- `profile.cy.ts` description edits stay on the visible `AutoSaveField` textarea. Do not insert a display-activation step for `profile-view-description-input` unless 1.0.6 stopped rendering that textarea while editable. Keep the owning-customer write and the mismatched `profile_id` 403. Do not switch the write to `admin`.
- `customer.cy.ts` keeps reading the readonly description textarea. Do not turn that field into an editor.
- `navigation.cy.ts` and `deployment.cy.ts` still pass. Touch them only if a 1.0.6 selector breaks. Keep Token-tab `admin-token-display-name-display` and chrome `nav-profile-name-display` assertions.
- `README.md` Testing / Automation Support names spa_utils **1.0.6**. State that this host does not assert a markdown resting view because it has no `MarkdownEditor` field, and that profile description remains an `AutoSaveField` textarea and customer description remains a readonly textarea. Do not document a local `data-card-grid` id.
- No list card dashboard. No local `CardGrid`. No pin change. No `/customer/customer` in `cy.url()` or `href`.

### Craftsmanship Expectations

- Use spa_utils automation ids. Do not invent a local markdown display or card grid to make a selector easier.
- Assert editor behavior at the layer that owns it. An `AutoSaveField` textarea that is always visible must not be rewritten as if it were `MarkdownEditor`.
- The failure mode to avoid is a spec that looks green because it types into a hidden textarea, or a profile spec “fixed” by clicking a display node `AutoSaveField` does not render.
- Do not retarget `profile.cy.ts` or `customer.cy.ts` at `/customer/config`. Do not restore a collection. Do not privilege profile writes with `admin`.

## Testing Expectations

Run all commands from **this SPA repository root**.

- Confirmation searches:
  - `rg 'MarkdownEditor|markdown-field-display|CardGrid|data-card-grid' cypress src` — zero, unless F012 migrated a real multi-card page (then assert that page’s `data-card-grid` only)
  - `rg 'marked|dompurify' package.json` — zero
  - `rg 'profile-view-description-input|customer-edit-description-input' cypress/e2e` — still the AutoSaveField textarea path and the readonly customer textarea path
- `npm run test`
- `npm run test:coverage`
- `npm run build` — `vue-tsc` is the type gate (this repo defines no `lint` script; do not add one)

**Packaging verification** (required — last task of the 1.0.6 set):

- `npm run container` — build the SPA container image
- `npm run service` — run db + API + SPA containers
- `npm run cypress:run` — headless end-to-end tests (long running); **all** specs must pass against `http://localhost:8388/customer/...`

Do not run `npm run dev` and `npm run service` at the same time — both bind host port **8388**.

Record results in **Execution Notes**. The gate that would look correct while bypassing the intended boundary is: a markdown spec typing into a textarea that was never opened; profile edits retargeted at a display node `AutoSaveField` does not render; profile writes seeded with `admin` so the ownership 403 disappears; or a new list card dashboard added so Cypress has something to click.

Env notes from prior waves: `GITHUB_FOREVER_TOKEN` as `GITHUB_TOKEN` if the file token is denied by GHCR; `IDP_LOGIN_URI=http://127.0.0.1:8080/login.html` before `mh up` so logout specs do not hang on a Tailscale IdP host.

## Outputs

Paths are relative to **this SPA repository root**.

**Update:**

- `README.md` — Testing / Automation Support version **1.0.6**; note there is no host markdown resting-view assertion because this SPA has no `MarkdownEditor`

**Update only if a 1.0.6 selector breaks or a real markdown textarea spec exists:**

- `cypress/e2e/profile.cy.ts` — only if the visible `AutoSaveField` textarea selector broke; must remain on `/customer/profile/`; do not add click-to-edit for non-markdown editors; do not seed `admin` for writes
- `cypress/e2e/customer.cy.ts` — only if the readonly description textarea selector broke; do not start typing into it
- `cypress/e2e/navigation.cy.ts`, `cypress/e2e/deployment.cy.ts` — only if a 1.0.6 selector breaks
- Any Cypress spec that types into a `MarkdownEditor` textarea without opening edit mode — activate `${automationId}-display`, then type into `${automationId}-input`

Do not change the spa_utils pin. Do not add `marked` or `dompurify`. Do not add a collection route or a `DataCardGrid` page. Do not pass disallowed `PageFrame` props. Do not edit `src/**` unless a spec failure proves a 1.0.6 selector bug that cannot be fixed in the spec — and do not convert `AutoSaveField` or the customer description into markdown to do it.

## Execution Notes

**Plan**
1. Confirm F012 pin is exact `1.0.6` and Cypress already targets AutoSaveField / readonly textarea (no MarkdownEditor).
2. Update README Testing / Automation Support only: document that this host does not assert a markdown resting view; profile description stays AutoSaveField; customer description stays readonly textarea.
3. Leave all Cypress specs unchanged unless a 1.0.6 selector broke.
4. Run confirmation searches + unit/coverage/build, then packaging (`container` → `service` → `cypress:run`).

**Commands / results**
- Confirmation searches:
  - `rg 'MarkdownEditor|markdown-field-display|CardGrid|data-card-grid' cypress src` → **zero** matches
  - `rg 'marked|dompurify' package.json` → **zero** matches
  - `rg 'profile-view-description-input|customer-edit-description-input' cypress/e2e` → profile AutoSaveField path + customer readonly textarea path still present
- `npm run test` → **PASS** (9 files / 39 tests)
- `npm run test:coverage` → **PASS** (97.64% stmts/lines)
- `npm run build` → **PASS** (`vue-tsc` + vite build)
- `npm run container` → **PASS** (image `ghcr.io/mentor-forge/mentorhub_customer_spa:latest`)
- `npm run service` → **PASS** (`GITHUB_TOKEN` from `GITHUB_FOREVER_TOKEN`; `IDP_LOGIN_URI=http://127.0.0.1:8080/login.html`; runtime-config confirmed)
- `npm run cypress:run` → **PASS** (23/23): `customer.cy.ts` (1), `deployment.cy.ts` (8), `navigation.cy.ts` (11), `profile.cy.ts` (3)

**Files changed**
- `README.md` — Testing / Automation Support: no markdown resting-view assertion; AutoSaveField + readonly description field notes for spa_utils **1.0.6**
- `tasks/PENDING.F013.spa_utils_1_0_6_cypress_and_packaging.md` — these Execution Notes

**Intentionally not changed**
- spa_utils pin (`1.0.6`)
- All Cypress specs (`profile.cy.ts`, `customer.cy.ts`, `navigation.cy.ts`, `deployment.cy.ts`)
- `src/**`, `package.json` / lockfile
- No `marked` / `dompurify`, no MarkdownEditor, no DataCardGrid / CardGrid / list card dashboard
- Status left **Pending**; filename left `PENDING.*`; no commit / push

**Orchestrator confirmation**
- Re-ran `npm run cypress:run` against the packaged service on `http://localhost:8388` → **PASS** 23/23. Marked Shipped.
