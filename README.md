# Mentor Hub — Customer SPA

This repository contains a Vue 3 single-page application (SPA) for the customer service.

## Prerequisites
- Mentor Hub [Developers Edition](https://github.com/mentor-forge/mentorhub/blob/main/CONTRIBUTING.md)
- Developer [SPA Standard Prerequisites](https://github.com/mentor-forge/mentorhub/blob/main/DeveloperEdition/standards/spa_standards.md)

## Quick Start

```sh
## Just run the service
npm run service 
```

> [!WARNING]
> `npm run dev` (Vite dev server) and `npm run service` (packaged container stack) both bind host port **8388**. Do not run them at the same time.

## Developer Commands

```sh
## install dependencies (run `mh` first for CodeArtifact auth)
npm ci

## install Cypress binaries
npx cypress install

## package code for deployment
npm run build 

## run dev server at http://localhost:8388/customer/ (assumes customer_api is running via `npm run api`)
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

## Route Table

All browser routes are served under the `/customer/` prefix (Vite `base: '/customer/'`):

| Browser URL | Route Path | Component | Description |
|---|---|---|---|
| `http://localhost:8388/customer/` | `/` | `CustomerEditPage.vue` | Home page for JWT-scoped customer |
| `http://localhost:8388/customer/profile/` | `/profile/` | `ProfilePage.vue` | Profile page for signed-in user |
| `http://localhost:8388/customer/profile/:id` | `/profile/:id` | `ProfilePage.vue` | Profile detail view |
| `http://localhost:8388/customer/subscriptions/new` | `/subscriptions/new` | `SubscriptionNewPage.vue` | New subscription form |
| `http://localhost:8388/customer/subscriptions/:id` | `/subscriptions/:id` | `SubscriptionEditPage.vue` | Subscription edit page |
| `http://localhost:8388/customer/dashboards/new` | `/dashboards/new` | `DashboardNewPage.vue` | New dashboard form |
| `http://localhost:8388/customer/dashboards/:id` | `/dashboards/:id` | `DashboardEditPage.vue` | Dashboard edit page |
| `http://localhost:8388/customer/cards/new` | `/cards/new` | `CardNewPage.vue` | New card form |
| `http://localhost:8388/customer/cards/:id` | `/cards/:id` | `CardEditPage.vue` | Card edit page |
| `http://localhost:8388/customer/events/new` | `/events/new` | `EventNewPage.vue` | New event form |
| `http://localhost:8388/customer/events/:id` | `/events/:id` | `EventViewPage.vue` | Event detail view |
| `http://localhost:8388/customer/journeys/:id` | `/journeys/:id` | `JourneyViewPage.vue` | Journey detail view |
| `http://localhost:8388/customer/ratings/:id` | `/ratings/:id` | `RatingViewPage.vue` | Rating detail view |
| `http://localhost:8388/customer/notes/:id` | `/notes/:id` | `NoteViewPage.vue` | Note detail view |
| `http://localhost:8388/customer/config` | `/config` | `AdminPage.vue` | Admin runtime configuration viewer |

## Architecture Overview

```
src/
  api/              # API client layer (types.ts, client.ts)
  components/       # App-specific UI components (admin components)
  pages/            # Route-level components (CustomerEditPage, ProfilePage, New, Edit/View pages)
  composables/      # App-specific composables (useAuth, useConfig, useRoles wrapper)
  stores/           # Pinia stores (UI state only)
  router/           # Vue Router configuration
  plugins/          # Vuetify plugin configuration
```

**Page Structure & Journey Boundary**: This Customer SPA hosts detail, new, and edit pages for customer resources, plus `/` (`CustomerEditPage.vue`), `/profile/` (`ProfilePage.vue`), and `/config` (`AdminPage.vue`). Collections and list card dashboards live on the Discovery journey SPA (`/discovery/...`).

**Note**: This SPA uses `@mentor-forge/mentorhub_spa_utils` for reusable components, composables, and utilities. See the [mentorhub_spa_utils README](../mentorhub_spa_utils/README.md) for complete documentation on available components (`AutoSaveField`, `AutoSaveSelect`), composables (`useErrorHandler`, `useRoles`), and utilities (`formatDate`, `validationRules`).

## Key Implementation Patterns

### Authentication
- JWT tokens stored in localStorage (`access_token`, `token_expires_at`)
- `useAuth()` composable manages authentication state and JWT claim reading (`getStoredCustomerId()`, `getStoredProfileId()`)
- Sign-in uses IdP / URL hash (`bootstrapAuthFromUrl` from spa_utils); APIs are not used as a login surface
- Router guards protect routes requiring authentication

### API Client
- Located in `src/api/client.ts`
- All API calls include JWT token from localStorage
- Error handling via `ApiError` class
- Type-safe with TypeScript interfaces in `src/api/types.ts`

### Data Fetching
- Uses TanStack Query (Vue Query) for server state management
- Query keys follow pattern: `['resource', id]`
- Mutations invalidate related queries on success
- Example: `useQuery({ queryKey: ['subscription', id], queryFn: () => api.getSubscription(id) })`

### Reusable Components and Composables
This SPA uses components and composables from `@mentor-forge/mentorhub_spa_utils`:
- **Shell**: `PageFrame` (Universal navigation shell with role-gated hamburger drawer and IdP logout; local nav configuration is disallowed)
- **Components**: `AutoSaveField`, `AutoSaveSelect`
- **Composables**: `provideEditorConfig`, `useErrorHandler`, `useRoles`, `useAuth`
- **Utilities**: `formatDate`, `validationRules`, `buildJourneyUrl`

See the [mentorhub_spa_utils README](../mentorhub_spa_utils/README.md) for complete documentation and usage examples.

### Component Architecture
- **App Shell**: `PageFrame` wraps `router-view` with standard app bar, hamburger menu, and auth actions.
- **Pages**: Own routing, data fetching, and mutations. Pass data + callbacks to components.
- **Components**: App-specific components (admin components). Reusable components come from `spa_utils`.
- **Composables**: App-specific logic (authentication, config). Reusable composables come from `spa_utils`.
- **Stores**: UI-only state (loading, error messages, etc.)

## Testing

### Unit Tests
- Uses Vitest for unit testing
- Test coverage target: 90%
- Tests cover: API client, composables, and components
- Run tests: `npm run test`
- Coverage report: `npm run test:coverage`

### E2E Tests
- Uses Cypress for end-to-end testing
- Tests cover main user flows: login, CRUD operations for each domain
- Run tests: `npm run cypress` (interactive) or `npm run cypress:run` (headless)

## Adding New Features

When adding a new resource or feature:

1. **Add API Types**: Extend `src/api/types.ts` with new interfaces
2. **Add API Methods**: Add methods to `src/api/client.ts`
3. **Create Pages**: Follow the appropriate pattern (List/New/Edit or List/New/View)
4. **Add Routes**: Register routes in `src/router/index.ts`
5. **Use spa_utils Components**: For edit pages with PATCH support, use `AutoSaveField`/`AutoSaveSelect` from `spa_utils`. For list pages, use `useResourceList` and `ListPageSearch`.
6. **Query Management**: Use Vue Query for data fetching with appropriate query keys
7. **Cache Invalidation**: Invalidate related queries in mutation `onSuccess` callbacks
8. **Error Handling**: Use `useErrorHandler` from `spa_utils` for consistent error handling
9. **Write Tests**: Add unit tests and E2E tests for new functionality (note: common components are tested in `spa_utils`)

## Automation Support

All interactive elements in this SPA include `data-automation-id` attributes following the `{domain}-{page}-{element}` naming convention.

## CI

`.github/workflows/docker-push.yml` builds and pushes the container image. Registry credentials and dependency policy for your org live in SRE / standards docs, not in this README.

## Configuration
- Runtime configuration available at `/api/config` endpoint
- Use enumerator values from config, not hardcoded in OpenAPI spec
- Docker container uses `API_HOST` and `API_PORT` environment variables for API proxy configuration
- Container listens on port 80 internally; map host port to container port 80 (e.g., `8185:80` in docker-compose)