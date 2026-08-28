# F001 – Retire list dashboards, land `/` CustomerEditPage and `/profile/` ProfilePage

**Status**: Complete  
**Type**: Feature  
**Depends On**: _(none — first task in this wave)_  
**Description**: Delete the nine list dashboards in this SPA (the only consumers of the `useInfiniteScroll` API that spa_utils **removes** in 1.0.0), along with their routes, Cypress specs, cursor-based API surface, and local drawer rows. Land the final in-app route table in the same task: `/` → new `CustomerEditPage.vue` and `/profile/` → new `ProfilePage.vue`. Stay on `@mentor-forge/mentorhub_spa_utils@0.2.2` here so the build stays green; the **1.0.0** pin is F002 and `PageFrame` is F003.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md` — `data-automation-id` convention `{domain}-{page}-{element}`
- `../mentorhub_spa_utils/README.md` — **Removed: infinite-scroll list APIs (Removed in 1.0.0)** (`useInfiniteScroll`, `InfiniteScrollResponse`, `InfiniteScrollParams`, `UseInfiniteScrollOptions`; cursor fields `after_id` / `limit` / `has_more` / `next_cursor` must not appear in SPA ↔ API contracts), **List cards** (Discovery is the only journey SPA that hosts CardGrid list dashboards)
- `README.md`
- `tasks/_ORCHESTRATE.md`
- `tasks/_PLANNING.md`
- `src/router/index.ts` — today `/` redirects to `/subscriptions`; nine list routes plus detail/new/edit routes and `/admin`; role-gate fallback is `next({ name: 'Subscriptions' })`
- `src/App.vue` — local app bar and drawer with nine `DOMAIN` sections of list links, `nav-admin-link`, and `nav-logout-link`
- `src/api/client.ts` — `getSubscriptions` / `getDashboards` / `getCards` / `getEvents` / `getProfiles` / `getCustomers` / `getJourneys` / `getRatings` / `getNotes` all take `InfiniteScrollParams` and return `InfiniteScrollResponse<T>`
- `src/api/types.ts` — locally declared `InfiniteScrollParams` (`after_id`, `limit`) and `InfiniteScrollResponse<T>` (`limit`, `has_more`, `next_cursor`)
- `src/api/*.client.test.ts` — list `it` blocks mock `has_more` / `next_cursor` payloads
- `src/pages/CustomerViewPage.vue`, `src/pages/ProfileViewPage.vue` — read-only detail pages that become the new home and profile pages
- `src/composables/useAuth.ts` — token / roles from `localStorage`; no JWT claim reader yet
- `cypress/e2e/*.cy.ts` — nine domain specs plus `navigation.cy.ts` asserting the local drawer sections

**Source issue**: F-CS12 ("Pin spa_utils 1.0.0, adopt PageFrame, remove list-card pages"). Users find collections on Discovery (`/discovery/members/`, `/discovery/resources`, …); Customer keeps **detail / edit** pages only.

**External prerequisite**: none. This task deliberately runs *before* the 1.0.0 pin and touches no dependency versions.

### Wave ordering (why removal comes before the 1.0.0 pin)

The two source issues are **F-CS11** (Vue `base` + SPA nginx prefix `/customer/`) and **F-CS12** (pin 1.0.0 + adopt `PageFrame` + remove list pages). This plan runs **removal (F001) → pin (F002) → `PageFrame` (F003) → base path (F004–F005) → Cypress and packaging (F006)** on purpose:

- All nine `*ListPage.vue` files import `useInfiniteScroll`, which **does not exist in 1.0.0**. Pinning first would force throwaway rewrites of pages this wave deletes anyway; deleting first means F002 is a clean version bump.
- `/` currently redirects to `/subscriptions`, and the role-gate fallback targets the `Subscriptions` route. Both die with the list pages, so the final home route (`CustomerEditPage`) must land in the same task.
- `src/App.vue` owns the local drawer whose rows point at the deleted list routes. Trimming those rows here and deleting the whole chrome in F003 is subtraction, not rework — the alternative (adopt `PageFrame` first) is impossible because `PageFrame` ships only in 1.0.0.
- `buildJourneyUrl` is a **1.0.0** API, so the role-gate fallback in this task stays an in-app route and moves to the Discovery journey URL in F003. That single follow-up edit is intentional and cheaper than blocking F001 on the pin.
- Route paths stay unprefixed here. Vite `base` (F004) prefixes every browser URL without touching route `path` strings, so nothing in this task is re-prefixed later.

### Locked route decisions

Vue paths stay unprefixed; the browser URLs in the left column are what F004/F005 produce once `base: '/customer/'` ships.

| Browser URL (after F004–F005) | Vue path | Page |
|---|---|---|
| `http://<host>:8080/customer/` | `/` | `CustomerEditPage.vue` (JWT-scoped customer) |
| `http://<host>:8080/customer/profile/` | `/profile/` | `ProfilePage.vue` (signed-in user) |
| `http://<host>:8080/customer/profile/{id}` | `/profile/:id` | `ProfilePage.vue` (Discovery member card deep link) |
| `http://<host>:8080/customer/subscriptions/new` | `/subscriptions/new` | `SubscriptionNewPage.vue` |
| `http://<host>:8080/customer/subscriptions/{id}` | `/subscriptions/:id` | `SubscriptionEditPage.vue` |
| `http://<host>:8080/customer/dashboards/new` | `/dashboards/new` | `DashboardNewPage.vue` |
| `http://<host>:8080/customer/dashboards/{id}` | `/dashboards/:id` | `DashboardEditPage.vue` |
| `http://<host>:8080/customer/cards/new` | `/cards/new` | `CardNewPage.vue` |
| `http://<host>:8080/customer/cards/{id}` | `/cards/:id` | `CardEditPage.vue` |
| `http://<host>:8080/customer/events/new` | `/events/new` | `EventNewPage.vue` |
| `http://<host>:8080/customer/events/{id}` | `/events/:id` | `EventViewPage.vue` |
| `http://<host>:8080/customer/journeys/{id}` | `/journeys/:id` | `JourneyViewPage.vue` |
| `http://<host>:8080/customer/ratings/{id}` | `/ratings/:id` | `RatingViewPage.vue` |
| `http://<host>:8080/customer/notes/{id}` | `/notes/:id` | `NoteViewPage.vue` |

`CustomerEditPage` and the self view of `ProfilePage` have no `:id` in the URL. Resolve identity in this order and record what the running API actually supports in **Execution Notes**:

1. Start the backing API (`npm run api`) and read the **definitive** contract from the running service: `curl -X GET "http://localhost:8387/docs/openapi.yaml"`.
2. If the API exposes a caller-scoped (`me`-style) customer or profile endpoint, use it and add the matching method to `src/api/client.ts` with a unit test.
3. Otherwise read the identifier from the stored access token: add a small claim reader to `src/composables/useAuth.ts` (for example `getStoredClaim(name)` plus `customerId` / `profileId` helpers reading `customer_id` / `custom:customer_id` and `profile_id` / `custom:profile_id`), and call the existing `getCustomer(id)` / `getProfile(id)`.
4. If neither an endpoint nor a claim is available, render an explanatory empty state instead of firing a request with `undefined`, and record it as a follow-up. Do **not** invent an identifier and do **not** hardcode one.

Editing is only as broad as the running API allows: `src/api/client.ts` has **no** customer or profile update method today. Where the running API documents a PATCH, wire fields with `AutoSaveField` (stable across 0.2.2 and 1.0.0) and add the client method plus its unit test. Where it does not, keep the field read-only and note the gap. Do **not** use `AutoSaveSelect` for enum fields — spa_utils 1.0.0 marks it legacy and prefers `EnumEditor` with runtime `/api/config` enumerators, which is available after F002.

## Goals

- The nine list dashboards are deleted and no source file imports `useInfiniteScroll`; a grep for `useInfiniteScroll`, `InfiniteScroll`, `after_id`, `has_more`, and `next_cursor` across `src/`, `cypress/`, and `tests/` returns nothing.
- `src/api/types.ts` no longer declares `InfiniteScrollParams` or `InfiniteScrollResponse`, and `src/api/client.ts` no longer has the nine cursor-based list methods. Detail getters (`getSubscription`, `getDashboard`, `getCard`, `getEvent`, `getProfile`, `getCustomer`, `getJourney`, `getRating`, `getNote`), the create/update methods used by kept pages, and `getConfig` are unchanged.
- `src/api/*.client.test.ts` drop only the `it` blocks covering removed methods; every kept method keeps its existing coverage so the `src/api/**` thresholds in `vitest.config.ts` still pass.
- `src/pages/CustomerEditPage.vue` exists and is the `/` route: it loads the JWT-scoped customer, uses `data-automation-id="customer-edit-page"` on the page container plus `{domain}-{page}-{element}` ids on fields, shows a loading state and an error snackbar (`useErrorHandler`), and has **no** "Back to List" navigation.
- `src/pages/ProfilePage.vue` exists and serves both `/profile/` (signed-in user) and `/profile/:id` (explicit id), with `data-automation-id="profile-view-page"` and no "Back to List" navigation.
- `src/router/index.ts` matches the locked route table: `/` → `CustomerEditPage`, `/profile/` and `/profile/:id` → `ProfilePage`, the kept detail/new/edit routes, `/config` → `AdminPage.vue` (`meta: { requiresAuth: true, requiresRole: 'admin' }`), and none of the removed routes. `createWebHistory()` stays as-is (F004 adds the base).
- The unauthenticated guard still calls `redirectToIdpLogin(window.location.origin + to.fullPath)`; the role-gate fallback becomes `next({ name: 'CustomerEdit' })` (F003 replaces it with a `buildJourneyUrl` Discovery redirect); `router.afterEach` still sets `document.title = 'Customer'`.
- `src/App.vue` keeps its current chrome shape but the drawer contains no rows for deleted routes: the nine `DOMAIN` subheaders, list/new links, and dividers are gone, and the admin row points at `/config`. Logout behavior is unchanged. Do not add replacement local nav — F003 deletes this chrome for `PageFrame`.
- Kept detail/new/edit pages no longer navigate to a deleted list route: any "Back to List" / cancel action either returns to `/` or is removed. No `router.push` or `to` in `src/pages/**` targets `/subscriptions`, `/dashboards`, `/cards`, `/events`, `/profiles`, `/customers`, `/journeys`, `/ratings`, or `/notes`.
- Cypress: `card.cy.ts`, `customer.cy.ts`, `dashboard.cy.ts`, `event.cy.ts`, `journey.cy.ts`, `navigation.cy.ts`, `note.cy.ts`, `profile.cy.ts`, `rating.cy.ts`, and `subscription.cy.ts` are reduced to direct-visit coverage of kept routes: specs whose only subject is a removed list route (or the local drawer) are deleted, and surviving specs drop `it` blocks that visit a list route or click through from one. New specs for `/` and `/profile/` are **F006**, which owns the whole Cypress rewrite under the `/customer/` prefix.
- `README.md` Architecture Overview reflects the new page set: no list dashboards in this SPA, collections live on Discovery, and this repo keeps the customer edit page, the profile page, and detail/create/edit pages.
- Dependency versions are untouched: `package.json` keeps `"@mentor-forge/mentorhub_spa_utils": "0.2.2"` in this task.

## Testing Expectations

Run all commands from **this SPA repository root**.

- `mh` (CodeArtifact auth) then `npm install --include=dev`
- `npm run test` — expect the reduced `src/api/*.client.test.ts` suites plus new `src/composables/useAuth.test.ts` coverage for any claim reader added above; `src/composables/**` thresholds require 90% lines
- `npm run build` — `vue-tsc` must be clean; this repo defines **no** `lint` script, so `npm run build` is the type gate. Do not add a lint script in this task; record the missing `npm run lint` from the issue acceptance criteria as a follow-up in Execution Notes.
- `npm run api` then `npm run dev` — manual check at `http://localhost:8388/`: `/` renders the customer edit page for a logged-in customer, `/profile/` renders the signed-in user's profile, the drawer has no list rows, and `/subscriptions` (removed) does not resolve to a page.

**Packaging verification:**

- `npm run container` — build the SPA container image
- `npm run service` — run db + API + SPA containers
- `npm run cypress:run` — headless end-to-end tests (long running). All surviving specs must pass at the un-prefixed origin; prefixed visits arrive in F006.

Do not run `npm run dev` and `npm run service` at the same time — both bind host port **8388**.

## Outputs

Paths are relative to **this SPA repository root**.

**Create:**

- `src/pages/CustomerEditPage.vue` — `/` home page for the JWT-scoped customer
- `src/pages/ProfilePage.vue` — `/profile/` and `/profile/:id`

**Update:**

- `src/router/index.ts` — locked route table, `/config`, role-gate fallback
- `src/App.vue` — drawer rows for deleted routes removed; admin row → `/config`
- `src/api/client.ts` — cursor list methods removed; any `me`-style or update method added per the running API
- `src/api/types.ts` — `InfiniteScrollParams` / `InfiniteScrollResponse` removed
- `src/api/Subscription.client.test.ts`, `src/api/Dashboard.client.test.ts`, `src/api/Card.client.test.ts`, `src/api/Event.client.test.ts`, `src/api/Profile.client.test.ts`, `src/api/Customer.client.test.ts`, `src/api/Journey.client.test.ts`, `src/api/Rating.client.test.ts`, `src/api/Note.client.test.ts` — list `it` blocks removed, new methods covered
- `src/composables/useAuth.ts`, `src/composables/useAuth.test.ts` — JWT claim reader (only if step 3 above applies)
- `src/pages/SubscriptionNewPage.vue`, `src/pages/SubscriptionEditPage.vue`, `src/pages/DashboardNewPage.vue`, `src/pages/DashboardEditPage.vue`, `src/pages/CardNewPage.vue`, `src/pages/CardEditPage.vue`, `src/pages/EventNewPage.vue`, `src/pages/EventViewPage.vue`, `src/pages/JourneyViewPage.vue`, `src/pages/RatingViewPage.vue`, `src/pages/NoteViewPage.vue` — remove navigation to deleted list routes
- `cypress/e2e/subscription.cy.ts`, `cypress/e2e/dashboard.cy.ts`, `cypress/e2e/card.cy.ts`, `cypress/e2e/event.cy.ts` — list-dependent `it` blocks removed
- `README.md` — page set and "collections live on Discovery"

**Delete:**

- `src/pages/SubscriptionsListPage.vue`, `src/pages/DashboardsListPage.vue`, `src/pages/CardsListPage.vue`, `src/pages/EventsListPage.vue`, `src/pages/ProfilesListPage.vue`, `src/pages/CustomersListPage.vue`, `src/pages/JourneysListPage.vue`, `src/pages/RatingsListPage.vue`, `src/pages/NotesListPage.vue`
- `src/pages/CustomerViewPage.vue`, `src/pages/ProfileViewPage.vue` — replaced by `CustomerEditPage.vue` / `ProfilePage.vue` (a `git mv` plus edits is fine)
- `cypress/e2e/customer.cy.ts`, `cypress/e2e/profile.cy.ts`, `cypress/e2e/journey.cy.ts`, `cypress/e2e/rating.cy.ts`, `cypress/e2e/note.cy.ts`, `cypress/e2e/navigation.cy.ts` — list-only and local-drawer specs; F006 adds the replacements

Do not change `package.json`, `package-lock.json`, `vite.config.ts`, `nginx.conf.template`, `Dockerfile`, `cypress.config.ts`, or `vitest.config.ts` in this task.

## Execution Notes

_Reserved for the task execution agent: plan, commands run, test results, follow-ups._
