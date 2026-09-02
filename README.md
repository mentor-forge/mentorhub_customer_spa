# Mentor Hub — Customer SPA

## Current State
Guidance for LLM Code Assistants - NOTE: We are currently pre-release. At this time, no changes should consider backward compatibility. Likewise, while we anticipate versioning releases in the future at this point, no consideration should be given to bumping any versions beyond managing the internal api_utils spa_utils dependencies. We are in a rapid iteration phase where features can be deprecated and removed without pause. When working in this repo we should keep our eyes out for potential re-usable code that could be migrated to spa_utils. This code should be implemented locally, and issues opened in the spa_utils repo when it is time to migrate code.

UI Components should stick to Vuetify styling, and leverage re-usable input components from SPA utils when possible. If a spa_utils component need to be updated, the code can be copied to this repo, edited, tested, and migrated to the utils repo like new re-usable components are.

## Prerequisites
- Mentor Hub [Developers Edition](https://github.com/mentor-forge/mentorhub/blob/main/CONTRIBUTING.md)
- Developer [SPA Standard Prerequisites](https://github.com/mentor-forge/mentorhub/blob/main/DeveloperEdition/standards/spa_standards.md)

## Quick Start

```sh
## Just run the service
npm run service 
```

| Service | Port | URL |
|---------|------|-----|
| Developer Edition login (IdP) | **8080** | `http://127.0.0.1:8080/login.html` |
| Customer SPA (welcome / ALB — **supported browser entry**) | **8080** | `http://<host>:8080/customer/` |
| Customer SPA (Vite dev or container — **direct-port debugging only**) | **8388** | `http://localhost:8388/customer/` |
| Customer API | **8387** | this SPA's nginx at `/customer/api/` (and `/api/` for direct-port debug) |

> [!WARNING]
> `npm run dev` (Vite dev server) and `npm run service` (packaged container stack) both bind host port **8388**. Do not run them at the same time.

The supported browser entry is `http://<host>:8080/customer/` through Developer Edition welcome / ALB. `http://localhost:8388/customer/` is for Cypress, OpenAPI, and debugging only. API calls from the app use `/customer/api/` and reach `customer_api` through this SPA's nginx.

`npm run dev` serves the app at `http://localhost:8388/customer/`.

### In-App Route Table

Vue route `path` strings stay unprefixed. Vite `base: '/customer/'` prefixes the browser URL.

| Browser URL | Vue Path | Page |
|---|---|---|
| `http://localhost:8388/customer/` | `/` | `CustomerEditPage.vue` (JWT-scoped customer) |
| `http://localhost:8388/customer/profile/` | `/profile/` | `ProfilePage.vue` (signed-in profile) |
| `http://localhost:8388/customer/profile/:id` | `/profile/:id` | `ProfilePage.vue` |
| `http://localhost:8388/customer/config` | `/config` | `AdminPage.vue` (Settings host: Token / Config Items / Versions / Enumerators; `admin` role required). Hamburger Settings stays on this origin via `hostingConfigHref()` (no `:8080` rewrite). |

## Developer Commands

```sh
## install dependencies (run `mh` first for CodeArtifact auth)
npm ci

## install Cypress binaries
npx cypress install

## package code for deployment
npm run build 

## run Vite dev server on http://localhost:8388/customer/ (assumes API is running)
npm run dev 

## run unit tests
npm run test

## run unit tests with coverage
npm run test:coverage

## run unit tests with UI
npm run test:ui

## run Cypress E2E tests
npm run cypress

## run Cypress E2E tests headlessly
npm run cypress:run

## start db + api containers
npm run api 

## start db + api + spa containers and open 
npm run service 

## open page in the browser
npm run open

## Build SPA docker container locally (run `mh` first)
npm run container
```

## Ownership

| Concern | Owner |
|---------|--------|
| Auth bootstrap, IdP redirect, `useAuth`, PageFrame, role-gated hamburger, `buildJourneyUrl` | `@mentor-forge/mentorhub_spa_utils` |
| Customer/profile pages, domain API client, JWT `customer_id` / `profile_id` claim readers | this SPA |
| Collection / list card dashboards | Discovery SPA (`/discovery/...`) |
| Browser→API prefix routing, history fallback, runtime-config cache headers | this SPA's `nginx.conf.template` |
| Authorization enforcement and domain writes | `customer_api` |

**Prohibited local patterns:** competing `useAuth` store; local nav config / ALB origin props on `PageFrame`; hard-coded journey prefixes or debug ports (`8388`, `8390`, …) in cross-SPA hrefs; CardGrid list dashboards (Discovery owns those).

## Architecture Overview

```
src/
  api/              # API client layer (types.ts, client.ts)
  components/       # App-specific UI components (admin components)
  pages/            # Route-level components (CustomerEditPage, ProfilePage, AdminPage)
  composables/      # App-specific composables (useConfig, useRoles wrapper; claim helpers; auth re-export)
  stores/           # Pinia stores (UI state only)
  router/           # Vue Router configuration
  plugins/          # Vuetify plugin configuration
```

**Page Structure & Journey Boundary**: This Customer SPA hosts `/` (`CustomerEditPage.vue`), `/profile/` (`ProfilePage.vue`), and `/config` (`AdminPage.vue`). Event create/get remain on the API client for other journeys; there is no Event page here. Collections and list card dashboards live on the Discovery journey SPA (`/discovery/...`).

**Note**: This SPA uses `@mentor-forge/mentorhub_spa_utils@1.0.2` for reusable components, composables, and utilities. See the [mentorhub_spa_utils README](../mentorhub_spa_utils/README.md) for complete documentation.

## Key Implementation Patterns

### Authentication
- JWT tokens stored in localStorage (`access_token`, `token_expires_at`, `user_roles`)
- Core auth (`useAuth`, `syncAuthFromStorage`, `getStoredRoles`, `hasStoredRole`, `redirectToIdpLogin`, `bootstrapAuthFromUrl`) from `@mentor-forge/mentorhub_spa_utils` — re-exported from `src/composables/useAuth.ts`; do not reimplement a local auth store
- Customer-local claim readers: `getStoredClaim`, `getStoredCustomerId`, `getStoredProfileId` (standard claim or `custom:` fallback). **Harvest candidate** for spa_utils once a second journey needs the same helpers
- Sign-in uses IdP / URL hash (`bootstrapAuthFromUrl`); APIs are not used as a login surface
- Router guards protect routes requiring authentication; `/config` also requires `admin`

### API Client
- Located in `src/api/client.ts`
- `API_BASE` is derived from Vite `BASE_URL` (`/customer/api` in production builds) — do not hard-code the journey prefix
- All API calls include JWT token from localStorage
- Error handling via `ApiError` class; `401` clears tokens and redirects via spa_utils `redirectToIdpLogin`
- Type-safe with TypeScript interfaces in `src/api/types.ts`

### Data Fetching
- Uses TanStack Query (Vue Query) for server state management
- Query keys follow pattern: `['resource', id]`
- Mutations invalidate related queries on success
- Example: `useQuery({ queryKey: ['profile', id], queryFn: () => api.getProfile(id) })`

### Reusable Components and Composables
This SPA uses components and composables from `@mentor-forge/mentorhub_spa_utils@1.0.2`:
- **Shell**: `PageFrame` (Universal navigation shell with role-gated hamburger drawer and IdP logout; local nav configuration is disallowed). The **1.0.2** catalog is compiled into spa_utils: **Home**, **Resources**, and **Paths** for any authenticated user (or when roles are empty/missing); **Plans** for `mentor`; **Notifications**, **Events**, and **Settings** for `admin` only. **Settings** lands on this SPA's `/config` via `hostingConfigHref()`. Products, Customer, and Customer Members are **not** hamburger rows — collection entry lives on Discovery cards.
- **Components**: Prefer `DataCard` + typed editors; `AutoSaveField` / `AutoSaveSelect` remain for legacy pages
- **Composables**: `provideEditorConfig`, `useErrorHandler`, `useRoles`, `useAuth`
- **Utilities**: `formatDate`, `validationRules`, `buildJourneyUrl`

See the [mentorhub_spa_utils README](../mentorhub_spa_utils/README.md) for complete documentation and usage examples.

### Component Architecture
- **App Shell**: `PageFrame` wraps `router-view` with standard app bar, hamburger menu, and auth actions.
- **Pages**: Own routing, data fetching, and mutations. Pass data + callbacks to components.
- **Components**: App-specific components (admin components). Reusable components come from `spa_utils`.
- **Composables**: App-specific logic (config, JWT claim helpers). Reusable composables come from `spa_utils`.
- **Stores**: UI-only state (loading, error messages, etc.)

### Deployment prefix & runtime config
- Supported browser entry: `http://<host>:8080/customer/` via welcome nginx / ALB
- Direct-port debugging only: `http://localhost:8388/customer/`; `/` and `/customer` redirect to `/customer/`
- Prefixed API: `/customer/api/` → `customer_api` (`^~` so the static-asset regex cannot capture API paths)
- Direct-port `/api/` kept for debugging only
- `/customer/runtime-config.js` and `/runtime-config.js` serve the same container-generated file with `Cache-Control: no-store` (never immutable)
- HTML under `/customer/` is `no-store`; fingerprinted `/customer/assets/*` may be `public, immutable`
- Runtime IdP URL is injected at container start (`IDP_LOGIN_URI`); it is not baked into the immutable build artifact

## Testing

### Unit Tests
- Uses Vitest for unit testing
- Test coverage target: 90%
- Tests cover: API client, composables, and components
- Run tests: `npm run test`
- Coverage report: `npm run test:coverage`

### E2E Tests
- Uses Cypress against the packaged SPA on `http://localhost:8388` (`npm run service`). Do not point Cypress at `:8080`
- Entry and visits are prefixed: `/customer/`, `/customer/profile/`, …
- Prefer `cy.visitPrefixed(...)` from `cypress/support/commands.ts` over raw `cy.visit` for in-app routes — it asserts `PerformanceNavigationTiming` so a Vue Router rewrite cannot mask an un-prefixed document fetch
- Specs: `navigation.cy.ts` (PageFrame chrome; customer vs admin drawer catalogs), `customer.cy.ts`, `profile.cy.ts` (customer read; owning-customer write; mismatched `profile_id` → API 403), `deployment.cy.ts` (redirects, history fallback, cache headers, runtime-config, authenticated and unauthenticated `/customer/api` proxy)
- UI role gating is UX evidence only — API authorization lives in `customer_api`. Do not seed `admin` for profile writes; that masks ownership checks
- Run tests: `npm run cypress` (interactive) or `npm run cypress:run` (headless)

> [!NOTE]
> Ensure the container service stack is running via `npm run service` before executing `npm run cypress:run`. `npm run dev` must not be running as both use port 8388.

## Adding New Features

When adding a new resource or feature:

1. **Add API Types**: Extend `src/api/types.ts` with new interfaces
2. **Add API Methods**: Add methods to `src/api/client.ts`
3. **Create Pages**: Follow the detail / edit pattern (collection lists live on Discovery)
4. **Add Routes**: Register routes in `src/router/index.ts`
5. **Use spa_utils Components**: For edit pages with PATCH support, prefer `DataCard` with type-aligned editors; do not invent local nav chrome
6. **Query Management**: Use Vue Query for data fetching with appropriate query keys
7. **Cache Invalidation**: Invalidate related queries in mutation `onSuccess` callbacks
8. **Error Handling**: Use `useErrorHandler` from `spa_utils` for consistent error handling
9. **Write Tests**: Add unit tests and E2E tests for new functionality (note: common components are tested in `spa_utils`)

## Automation Support

All interactive elements in this SPA include `data-automation-id` attributes following the `{domain}-{page}-{element}` naming convention.

Cypress targets spa_utils `PageFrame` ids for chrome, not local ones:

- Always present for authenticated users: `nav-drawer-toggle`, `page-frame-title`, `nav-profile-link`, `nav-home-link`, `nav-events-link`, `nav-logout-link`
- Admin-only: `nav-notifications-link`, `nav-settings-link`
- Settings (`nav-settings-link`) stays on this SPA's hosting origin at `/customer/config`; Home, Events, Notifications, and Profile use welcome / ALB journey URLs.
- Removed from the hamburger catalog in `spa_utils` 1.0.1: `nav-products-link`, `nav-customer-link`, `nav-customer-members-link`

Do not define host `nav-*` ids in this SPA.

## CI

`.github/workflows/docker-push.yml` builds and pushes the container image. Registry credentials and dependency policy for your org live in SRE / standards docs, not in this README.

## Configuration
- **Supported browser entry**: `http://<host>:8080/customer/` via Developer Edition welcome / ALB
- **Direct-port debugging only**: `http://localhost:8388/customer/` (Cypress, OpenAPI, `npm run service`); `http://localhost:8388/` redirects to `/customer/`
- **API proxy**: the client calls `/customer/api/` (derived from Vite `base`); container nginx proxies that to `http://${API_HOST}:${API_PORT}/api/` on `customer_api` (port **8387**). Direct-port `/api/` is kept for debugging
- Runtime enumerators come from `GET /customer/api/config` (or `/api/config` on the direct port), not from OpenAPI
- Docker container uses `API_HOST`, `API_PORT`, and `IDP_LOGIN_URI` environment variables
- Container listens on port 80 internally; map host port to container port 80 (e.g., `8388:80` in docker-compose)
