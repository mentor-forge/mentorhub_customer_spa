# F006 – Cypress e2e under `/customer/` and full packaging verification

**Status**: Pending  
**Type**: Feature  
**Depends On**: `F005_nginx_customer_prefix_and_api_client`  
**Description**: Re-point every Cypress visit to the `/customer/` prefix, replace the deleted local drawer coverage with the spa_utils `PageFrame` automation ids, add specs for the customer edit home page and the profile page, and run the full packaged stack as the acceptance gate for both source issues (F-CS11 and F-CS12).

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md` — `data-automation-id` convention and Cypress selector rules
- `../mentorhub_spa_utils/README.md` — **Universal PageFrame (1.0.0)** automation ids and the role-gated catalog; **Cross-SPA URLs** (direct SPA debug ports are for Cypress and debugging only)
- `README.md` — Testing section
- `tasks/_ORCHESTRATE.md`
- `tasks/_PLANNING.md`
- `tasks/PENDING.F001.retire_list_dashboards.md` — locked route table and the specs deleted there
- `cypress.config.ts` — `baseUrl: 'http://localhost:8388'`, spa_utils JWT sign task, esbuild preprocessor
- `cypress/support/e2e.ts`, `cypress/support/commands.ts` — `cy.login()` support
- `cypress/e2e/*.cy.ts` — the specs surviving F001, still visiting un-prefixed paths
- `src/pages/CustomerEditPage.vue`, `src/pages/ProfilePage.vue` — automation ids to assert
- `nginx.conf.template`, `Dockerfile` — F005 prefix serving and runtime-config generation

**Ports:** `cypress.config.ts` `baseUrl` stays `http://localhost:8388` (the published container port). Visits become prefixed paths such as `/customer/`, `/customer/profile/`, and `/customer/subscriptions/{id}` — not `/` or `/profile/`. Do not point Cypress at the welcome origin on `:8080`; single-SPA e2e runs against the direct port.

`npm run dev` and `npm run service` both bind host port **8388**. Cypress runs against `npm run service`, so no dev server may be running.

## Goals

- Every `cy.visit(...)` and every `cy.url().should('include', ...)` in `cypress/e2e/**` uses the `/customer/` prefix, matching the F001 route table.
- Navigation coverage is restored with spa_utils ids only: `nav-drawer-toggle`, `page-frame-title`, `nav-profile-link`, `nav-customer-link`, `nav-customer-members-link`, `nav-logout-link`. No SPA-local drawer selector (`nav-subscriptions-list-link`, `nav-dashboards-list-link`, `nav-admin-link`, domain subheaders, …) survives anywhere in `cypress/`.
  - The drawer test asserts that `nav-customer-link` and `nav-customer-members-link` are absolute `:8080` hrefs (welcome / ALB origin), not Vue Router links, and that `nav-profile-link` targets `/customer/profile/`.
  - The logout test asserts auth is cleared and the browser leaves for the IdP login URL.
- New specs cover the two kept pages: the customer edit home page at `/customer/` (loads the JWT-scoped customer, shows its fields, saves any field the running API supports) and the profile page at `/customer/profile/`.
- No spec references a removed route (`/subscriptions`, `/dashboards`, `/cards`, `/events`, `/profiles`, `/customers`, `/journeys`, `/ratings`, `/notes`, `/admin`) or a deleted list page's automation ids.
- `cy.login()` continues to seed a JWT via the spa_utils sign task, with `localStorage` written for the prefixed origin so same-origin JWT storage works when the app is opened under `/customer/`.
- `README.md` Testing section documents the prefixed Cypress entry point and that `npm run service` must be running (not `npm run dev`).
- No production source behavior changes in this task. Touch `src/**` only if a spec exposes a missing or wrong `data-automation-id`, and keep any such change to the id attribute.

## Testing Expectations

Run all commands from **this SPA repository root**.

- `npm run test`
- `npm run build` — `vue-tsc` is the type gate (this repo defines no `lint` script)

**Packaging verification (the acceptance gate for this wave):**

- `npm run container` — build the SPA container image
- `npm run service` — run db + API + SPA containers
- `npm run cypress:run` — headless end-to-end tests (long running); **all** specs must pass against `http://localhost:8388/customer/...`
- `curl -i http://localhost:8388/customer/` — still `200 text/html` with `/customer/` asset URLs (regression check on F005)
- If Developer Edition welcome is up on `:8080`, confirm `http://localhost:8080/customer/` serves this SPA, that login round-trips through `http://<host>:8080/login.html`, and that API calls from the prefixed origin reach `customer_api`. Record it as an external check if welcome is not part of the running stack.

Acceptance criteria from the source issues that must hold at the end of this task: `:8080/customer/` serves this SPA (not welcome's `index.html`), `:8388/customer/` works for single-SPA Cypress, API calls from the prefixed origin reach `customer_api` through this SPA's nginx, and the unit plus e2e suites pass. The issues also list `npm run lint`; this repo has no `lint` script — record that gap as a follow-up rather than adding tooling here.

## Outputs

Paths are relative to **this SPA repository root**.

**Create:**

- `cypress/e2e/navigation.cy.ts` — `PageFrame` app bar, drawer, profile link, and logout using spa_utils ids
- `cypress/e2e/customer.cy.ts` — customer edit home page at `/customer/`
- `cypress/e2e/profile.cy.ts` — profile page at `/customer/profile/`

**Update:**

- `cypress/e2e/subscription.cy.ts`, `cypress/e2e/dashboard.cy.ts`, `cypress/e2e/card.cy.ts`, `cypress/e2e/event.cy.ts` — prefixed visits and URL assertions
- `cypress/support/commands.ts`, `cypress/support/e2e.ts` — only if `cy.login()` needs the prefixed origin
- `README.md` — Testing section

Do not change `cypress.config.ts` `baseUrl`, `vite.config.ts`, `nginx.conf.template`, `Dockerfile`, `package.json`, or `src/api/client.ts` in this task.

## Execution Notes

_Reserved for the task execution agent: plan, commands run, test results, follow-ups._
