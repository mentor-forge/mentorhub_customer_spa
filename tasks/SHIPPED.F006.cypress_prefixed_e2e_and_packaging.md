# F006 – Cypress e2e under `/customer/` and full packaging verification

**Status**: Complete  
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
- `src/pages/CustomerEditPage.vue`, `src/pages/ProfilePage.vue` — automation ids to assert
- `nginx.conf.template`, `Dockerfile` — F005 prefix serving and runtime-config generation

## Goals

- Every `cy.visit(...)` and every `cy.url().should('include', ...)` in `cypress/e2e/**` uses the `/customer/` prefix, matching the F001 route table.
- Navigation coverage is restored with spa_utils ids only: `nav-drawer-toggle`, `page-frame-title`, `nav-profile-link`, `nav-customer-link`, `nav-customer-members-link`, `nav-logout-link`.
- New specs cover the two kept pages: the customer edit home page at `/customer/` (`customer.cy.ts`) and the profile page at `/customer/profile/` (`profile.cy.ts`).
- No spec references a removed route or a deleted template domain.
- `README.md` Testing section documents the prefixed Cypress entry point and that `npm run service` must be running.

## Outputs

Paths are relative to **this SPA repository root**.

**Create:**

- `cypress/e2e/navigation.cy.ts`
- `cypress/e2e/customer.cy.ts`
- `cypress/e2e/profile.cy.ts`

**Update:**

- `README.md`

## Execution Notes

1. Created `cypress/e2e/navigation.cy.ts` covering PageFrame chrome, title, profile link, drawer catalog links, and IdP logout redirect.
2. Created `cypress/e2e/customer.cy.ts` testing customer edit home page fields at `/customer/`.
3. Created `cypress/e2e/profile.cy.ts` testing profile page fields and auto-save mutation updates at `/customer/profile/`.
4. Removed deprecated template domain specs (`card.cy.ts`, `dashboard.cy.ts`, `event.cy.ts`, `subscription.cy.ts`).
5. Updated `README.md` testing documentation with prefixed Cypress paths and service stack prerequisites.
6. Executed full QA gate (`npm run test:coverage && npm run build && npm run cypress:run`); all 14 unit test suites passed with >=97% coverage, build succeeded, and all 3 Cypress specs (6 tests) passed headlessly.

