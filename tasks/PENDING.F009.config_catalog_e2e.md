# F009 – 1.0.1 catalog, `/customer/config` Cypress and packaging

**Status**: Pending  
**Type**: Feature  
**Depends On**: `F008_host_admin_page_at_config`  
**Description**: Point Cypress at the spa_utils **1.0.1** hamburger catalog, prove Settings opens this SPA’s `/customer/config`, cover Token claims, admin-gate `/config`, and verify logout `return_to=/discovery/`. Run the packaged SPA as the acceptance gate for F-CS13.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md` — E2E covers pages; automation ids are a stable UI API
- `../mentorhub_spa_utils/README.md` — **Universal PageFrame (1.0.1)**: catalog table; removed ids `nav-products-link`, `nav-customer-link`, `nav-customer-members-link`; new `nav-events-link`; kept `nav-settings-link` whose href is `hostingConfigHref()` (hosting origin, **no** `:8080` rewrite); Notifications + Settings **admin-only**; empty/missing roles → Home + Events; logout `return_to` = `buildJourneyUrl('discovery')` → `/discovery/`; Token tab ids `admin-token-profile-id-display`, `admin-token-customer-id-display`, `admin-token-mentor-id-display`
- `README.md` — Testing / Automation Support still describe 1.0.0 rows (`nav-customer-link`, `nav-customer-members-link`, `nav-products-link`) and treat Notifications as always present
- `tasks/_ORCHESTRATE.md`
- `tasks/_PLANNING.md`
- `cypress.config.ts` — `baseUrl` stays `http://localhost:8388`
- `cypress/support/e2e.ts` — `registerAuthCommands({ visitPath: '/customer/' })`
- `cypress/support/commands.ts` — `visitPrefixed` (no `loginAsCustomer` helper; use `cy.login(['customer'])` / `cy.login(['admin'])`)
- `cypress/e2e/navigation.cy.ts` — still encodes the **1.0.0** catalog: customer rows are Home + Customer + Customer Members + Notifications; admin rows include Products and Settings → `/admin/settings` via `assertAlbHref`; logout only asserts `return_to` is present and comments that PageFrame returns to the **root** origin
- `cypress/e2e/deployment.cy.ts` — nginx prefix / API proxy; keep (no catalog rewrite unless a selector breaks)
- `cypress/e2e/customer.cy.ts`, `cypress/e2e/profile.cy.ts` — prefixed detail coverage; keep
- `src/router/index.ts` — `/config` (F001 / F008), existing detail/edit routes; role-gate uses `window.location.replace(buildJourneyUrl(...home...))` (cross-origin `:8080/discovery/`)

Cypress runs against **8388**. Collection hamburger `href`s from `buildJourneyUrl` still include **`:8080`**. **Settings is the exception:** `hostingConfigHref()` stays on the current origin (`http://localhost:8388/customer/config`), not welcome `:8080`, and not `/admin/settings`.

This SPA does **not** host an Events **collection**. `nav-events-link` is a Discovery ALB href (`http://localhost:8080/discovery/events`). Assert the `href`; do not follow it and do not add an Events list route here. Keep the existing event **detail/create** pages (`/events/new`, `/events/:id`).

`/` is `CustomerEditPage`, so `visitPath: '/customer/'` remains a valid in-app seed. Prefer `cy.visitPrefixed` for in-app routes other than the login seed. Hamburger **Home** is still Discovery (`:8080/discovery/`), not this SPA’s `/customer/` — do not treat `nav-home-link` as `CustomerEditPage`.

`npm run dev` and `npm run service` both bind host port **8388**. Cypress runs against `npm run service`.

`cy.login()` with no argument seeds an **admin** token. Use `cy.login(['customer'])` for the least-privileged catalog (Home + Events, **not** Notifications/Settings, **not** Customer / Customer Members). Use `cy.login(['admin'])` for Settings. Pick roles deliberately — do not assert “only four 1.0.0 customer rows exist” against a default `cy.login()`.

## Goals

- **Catalog (customer-only login):** ordered rows are Home and Events. `nav-notifications-link` and `nav-settings-link` are **absent**. Home `href` is welcome `:8080/discovery/`. Events `href` is welcome `:8080/discovery/events`. Profile avatar still targets `/customer/profile/` on `:8080`. Do **not** expect `nav-customer-link` or `nav-customer-members-link`.
- **Catalog (admin-only login):** Home, Events, Notifications, Settings. Mentor browse rows (`nav-resources-link`, `nav-paths-link`, `nav-plans-link`) are absent. Notifications `href` is `:8080/discovery/notifications`. **Settings** `href` is `http://localhost:8388/customer/config` (hosting origin). Assert **before** click: includes `:8388`, does **not** include `:8080`, does **not** include `/admin/settings`, does **not** include `/customer/customer`. Clicking it stays on this SPA at pathname `/customer/config`.
- **Removed hamburger rows:** `nav-products-link`, `nav-customer-link`, and `nav-customer-members-link` are **absent** for every role checked (admin, customer, and at least one other least-privileged login if used). Do not restore them locally.
- **Notifications and Settings only for `admin`.** A customer-only login must **not** show those rows. Events is visible for authenticated users including customer.
- **Token tab:** after admin Settings navigation, stub `GET /customer/api/config` (or `**/customer/api/config`) with a `token` object carrying `profile_id`, `customer_id`, and `mentor_id`. Open the Token tab (`admin-tab-token`) and assert `admin-token-profile-id-display`, `admin-token-customer-id-display`, `admin-token-mentor-id-display` (read-only input values, matching spa_utils `TokenClaimsCard`).
- **Config gate:** a login **without** `admin` visiting `/customer/config` must **not** remain on that path showing AdminPage. The existing guard calls `window.location.replace(buildJourneyUrl(...home...))` (cross-origin `:8080/discovery/`). Cypress cannot follow that the way it follows same-origin CustomerEdit — prove the negative at the boundary: pathname is no longer `/customer/config` and Token/config chrome is not shown. If the browser unloads toward `:8080/discovery/`, that is success. Do **not** add a local Home fallback to make the test easier. An admin visit stays on `/customer/config`.
- **Logout:** after `nav-logout-link`, IdP stub still loads and `return_to` is welcome origin `http://localhost:8080/discovery/` — not a hardcoded `127.0.0.1` SPA URL, not bare `/` as the only path, not `/customer/` as the return. Update or delete the F006 comment that treated missing `/discovery/` as a spa_utils limitation.
- Existing prefix / API / drawer-close / unauthenticated-deep-link / runtime-config / title coverage in `navigation.cy.ts` still passes. Detail specs (`customer`, `profile`) and `deployment.cy.ts` still pass; touch them only if a 1.0.1 catalog id or `/admin` vs `/config` assertion breaks.
- Prefer asserting `/customer/config` as the Settings host. There is no `/admin` route to keep.
- No `/customer/customer` in `cy.url()` or `href`.
- `README.md` Testing / Automation Support lists 1.0.1 ids: Events for authenticated users; Notifications + Settings **admin-only**; Settings → hosting `/customer/config`; Products / Customer / Customer Members absent.

### Craftsmanship Expectations

- Use spa_utils PageFrame automation ids; do not invent a local drawer.
- Assert Settings at the layer that owns it (`hostingConfigHref` on the current origin) and Events/Home at the layer that owns them (`buildJourneyUrl` on welcome `:8080`). A test that only checks the final page without the href origin would miss a `:8080` rewrite bug on Settings.
- Do not restore Products / Customer / Members rows, or customer Notifications, to make an old assertion pass.
- Keep journey-specific detail specs intact; this task is catalog + config + logout, not a CRUD rewrite.

## Testing Expectations

Run all commands from **this SPA repository root**.

- `npm run test`
- `npm run test:coverage`
- `npm run build` — `vue-tsc` is the type gate (this repo defines no `lint` script; record the missing `npm run lint` from issue acceptance criteria as a follow-up rather than adding tooling)

**Packaging verification** (required — last task of the F-CS13 / 1.0.1 set):

- `npm run container` — build the SPA container image
- `npm run service` — run db + API + SPA containers
- `npm run cypress:run` — headless end-to-end tests (long running); **all** specs must pass against `http://localhost:8388/customer/...`

Do not run `npm run dev` and `npm run service` at the same time — both bind host port **8388**.

Record results in **Execution Notes**. The gate that would look correct while bypassing the intended boundary is: Settings `href` rewritten to `:8080` or `/admin/settings`; a non-admin remaining on `/customer/config`; or logout `return_to` pointing at SPA root `/` instead of `/discovery/`. Include those negative assertions.

## Outputs

Paths are relative to **this SPA repository root**.

**Update:**

- `cypress/e2e/navigation.cy.ts` — 1.0.1 catalog (customer vs admin vs least-privileged), Settings `http://localhost:8388/customer/config`, Events `:8080/discovery/events`, removed Products/Customer/Members ids, admin-only Notifications/Settings, Token tab claims, `/customer/config` role gate, logout `return_to=/discovery/`
- `cypress/e2e/deployment.cy.ts` — only if a prefix assertion must mention `/config`
- `cypress/e2e/customer.cy.ts`, `cypress/e2e/profile.cy.ts` — only if a 1.0.1 catalog or Settings selector breaks
- `cypress/support/commands.ts` / `cypress/support/e2e.ts` — only if visit helpers need a config-page path
- `cypress/fixtures/**` — only if Token/config intercepts need a fixture
- `README.md` — Testing / Automation Support 1.0.1 hamburger ids and Settings host

Do not restore a local drawer. Do not change the spa_utils pin. Do not add an Events collection route or list dashboards. Do not pass disallowed `PageFrame` props.

## Execution Notes

_Reserved for the task execution agent._
