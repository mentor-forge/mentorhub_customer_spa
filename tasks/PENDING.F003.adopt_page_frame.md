# F003 – Adopt spa_utils `PageFrame` and delete the local chrome

**Status**: Pending  
**Type**: Feature  
**Depends On**: `F002_pin_spa_utils_1_0_0`  
**Description**: Replace this SPA's local app bar, navigation drawer, and logout handler with the imported `PageFrame`, and provide runtime editor config at the app root so typed editors resolve `/api/config` enumerators. Switch the router role gate to leave for the Discovery journey via `buildJourneyUrl`. Route paths keep the shape F001 established; the `/customer/` base path is F004.

## Context

Always read these files before implementation:

- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `../mentorhub_spa_utils/README.md` — **Universal PageFrame (1.0.0)** (allowed props, compiled role-gated hamburger catalog, "local nav config is disallowed"), **Cross-SPA URLs** (`buildJourneyUrl`, `JOURNEY_APP_PATHS`, `resolveAlbOrigin`), **Runtime enumerators** (`provideEditorConfig`)
- `README.md` — Key Implementation Patterns / Component Architecture
- `tasks/_ORCHESTRATE.md`
- `tasks/_PLANNING.md`
- `tasks/PENDING.F001.retire_list_dashboards.md` — wave-ordering rationale and the locked route table
- `src/App.vue` — local `v-app-bar`, `v-app-bar-nav-icon` (`nav-drawer-toggle`), `v-navigation-drawer`, the `/config` and logout rows, `drawer` ref, `router.afterEach` drawer close, `handleLogout`, and the local `useRoles` / `hasAdminRole` usage
- `src/router/index.ts` — after F001: `/` → `CustomerEditPage`, `/profile/` + `/profile/:id`, kept detail routes, `/config`; role-gate fallback `next({ name: 'CustomerEdit' })`
- `src/composables/useConfig.ts` — app-owned `GET /api/config` startup fetch
- `src/composables/useRoles.ts` — local `hasRole` wrapper; drawer role gating moves into spa_utils
- `src/main.ts` / `src/initAuth.ts` — IdP bootstrap; keep as today

`PageFrame` is exported from the package **root** and already wraps `v-main`. Drawer rows are absolute welcome / ALB `href` values built by `buildJourneyUrl` (targets are usually other SPAs), not Vue Router `to`. Logout is built into the drawer footer (`nav-logout-link`).

**Allowed props only:** `pageTitle` (required) and optional display-only `customerName`. Do **not** pass `navItems`, URL maps, ALB origin, role tables, or extra drawer slots. Omit `customerName` and let spa_utils read JWT `customer_name` / `custom:customer_name`, falling back to the literal `Customer`.

The compiled catalog routes the customer role to `[Customer Name]` → `/customer/` and `[Customer Name] Members` → `/discovery/members/`, and the app-bar avatar to `/customer/profile/`. Those are exactly the two pages this repo keeps, which is why no local nav is needed. Drawer hrefs already point at the welcome origin on `:8080`, so they are correct before this SPA's nginx serves the prefix and start resolving to this app when F005 ships.

## Goals

- `src/App.vue` becomes a single host `v-app` wrapping `PageFrame`:

  ```vue
  <v-app>
    <PageFrame page-title="Customer">
      <router-view />
    </PageFrame>
  </v-app>
  ```

  - Remove the local `v-app-bar`, `v-app-bar-title`, `v-app-bar-nav-icon`, `v-navigation-drawer`, all drawer `v-list` rows, the `drawer` ref, the `router.afterEach` drawer close, `handleLogout`, and the local `useRoles` / `hasAdminRole` usage in this component.
  - There must be exactly one app bar and no local hamburger configuration.
- `src/App.vue` keeps the authenticated startup config fetch (`useConfig().loadConfig()` in `onMounted`, guarded by `isAuthenticated`, with the existing `console.warn` on failure) and adds `provideEditorConfig(config)` from spa_utils so typed editors resolve runtime enumerators. Do not add a second startup fetch.
- No `data-automation-id` beginning with `nav-` is defined in this repo any more. The drawer, title, profile, and logout ids come from spa_utils: `nav-drawer-toggle`, `page-frame-title`, `nav-profile-link`, `nav-customer-link`, `nav-customer-members-link`, `nav-logout-link`.
- The router role gate no longer targets a local route. When `requiresRole` is not satisfied, leave the SPA for the Discovery journey home:
  - build the target with `buildJourneyUrl` (or `JOURNEY_APP_PATHS.home`),
  - navigate with `window.location.replace(...)` and call `next(false)`,
  - do not silently render a gated page to a user without the role.
- The unauthenticated `requiresAuth` guard still calls `redirectToIdpLogin(window.location.origin + to.fullPath)` and `next(false)`; `router.afterEach` still sets `document.title = 'Customer'`. (Base-aware return URLs are F004.)
- Route paths are unchanged in this task: no renames, no new routes, no base prefix.
- Any enum field on `CustomerEditPage.vue` or `ProfilePage.vue` that still uses `AutoSaveSelect` with a hard-coded `items` array may move to `EnumEditor` now that `provideEditorConfig` is in place — only if the running API's `/api/config` publishes the matching enumerator (verify with `npm run api`, then `curl -X GET "http://localhost:8387/docs/openapi.yaml"` and the live `/api/config` payload). Otherwise leave the field as it is and note it.
- `README.md` records that `PageFrame` from spa_utils 1.0.0 is the navigation shell, that local nav config is disallowed, and that Cypress uses the spa_utils automation ids listed above.

## Testing Expectations

Run all commands from **this SPA repository root**.

- `npm run test` — update or remove any unit test asserting local drawer markup or `handleLogout`
- `npm run build` — `vue-tsc` is the type gate (this repo defines no `lint` script)
- `npm run api` then `npm run dev` — manual check at `http://localhost:8388/`:
  - the shared app bar renders with the title `Customer` and a single bar
  - the hamburger opens the spa_utils drawer; a customer login shows `[Customer Name]` and `[Customer Name] Members` rows as absolute `:8080` URLs
  - the avatar links to `http://<host>:8080/customer/profile/`
  - logout clears auth and leaves via the IdP
  - a login without the required role on `/config` is redirected out to the Discovery journey home

**Packaging verification:**

- `npm run container` — build the SPA container image
- `npm run service` — run db + API + SPA containers
- `npm run cypress:run` — headless end-to-end tests (long running); the specs surviving F001 must still pass. Drawer and title coverage using the spa_utils ids is added in **F006** with the rest of the Cypress rewrite.

Do not run `npm run dev` and `npm run service` at the same time — both bind host port **8388**.

## Outputs

Paths are relative to **this SPA repository root**.

**Update:**

- `src/App.vue` — `PageFrame` shell, `provideEditorConfig`, local chrome removed
- `src/router/index.ts` — role-gate fallback leaves for Discovery via `buildJourneyUrl`
- `src/pages/CustomerEditPage.vue`, `src/pages/ProfilePage.vue` — only if an enum field moves to `EnumEditor` per the goal above
- `README.md` — PageFrame as the nav shell, spa_utils automation ids, no local nav config

Do not change `vite.config.ts`, `nginx.conf.template`, `Dockerfile`, `package.json`, `cypress.config.ts`, or `src/api/client.ts` in this task, and do not pass disallowed `PageFrame` props.

## Execution Notes

_Reserved for the task execution agent: plan, commands run, test results, follow-ups._
