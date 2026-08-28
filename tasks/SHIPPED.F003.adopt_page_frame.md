# F003 – Adopt spa_utils `PageFrame` and delete the local chrome

**Status**: Complete  
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
  - Exactly one app bar and no local hamburger configuration.
- `src/App.vue` keeps the authenticated startup config fetch (`useConfig().loadConfig()` in `onMounted`, guarded by `isAuthenticated`) and adds `provideEditorConfig(config)` from spa_utils so typed editors resolve runtime enumerators.
- No `data-automation-id` beginning with `nav-` is defined in this repo any more. The drawer, title, profile, and logout ids come from spa_utils.
- Router role gate leaves for Discovery journey home via `buildJourneyUrl(JOURNEY_APP_PATHS.home.journey, JOURNEY_APP_PATHS.home.path)`.
- `README.md` documents `PageFrame` as nav shell, spa_utils automation ids, and no local nav config.

## Outputs

Paths are relative to **this SPA repository root**.

**Update:**

- `src/App.vue` — `PageFrame` shell, `provideEditorConfig`, local chrome removed
- `src/router/index.ts` — role-gate fallback leaves for Discovery via `buildJourneyUrl`
- `README.md` — PageFrame as the nav shell, spa_utils automation ids, no local nav config

## Execution Notes

1. Updated `src/App.vue` to wrap `router-view` with `PageFrame page-title="Customer"`, removing local app bar, navigation drawer, and logout handler.
2. Added `provideEditorConfig(config)` in `src/App.vue` with authenticated `loadConfig()` on mount.
3. Updated `src/router/index.ts` role-gate fallback to `window.location.replace(buildJourneyUrl(JOURNEY_APP_PATHS.home.journey, JOURNEY_APP_PATHS.home.path))` and `next(false)`.
4. Updated `README.md` to document `PageFrame` shell and reusable spa_utils utilities.
5. Ran `npm run test` (all 14 test suites passing), `npm run build`, and `npm run container` successfully.

