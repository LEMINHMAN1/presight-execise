# User Directory

A full-stack user directory application with search, filtering, infinite scroll, and URL-synced state.

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | ≥ 20 | Runtime |
| Express | 5 | HTTP server |
| better-sqlite3 | 11 | Synchronous SQLite driver |
| TypeScript | 5 | Type safety |
| @faker-js/faker | 8 | Seed data generation |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15 (App Router) | React framework |
| React | 19 | UI |
| Tailwind CSS | 4 | Styling |
| @tanstack/react-virtual | 3 | List virtualization |
| lodash | 4 | Debounce |
| TypeScript | 5 | Type safety |

### Infrastructure
- **SQLite** — persisted source of truth, file-based, no separate database process needed
- **Docker Compose** — multi-container setup with healthcheck and named volume for data persistence
- **npm workspaces** — monorepo managing `client/` and `server/` from root

---

## Architecture

Both client and server follow **Domain-Driven Design (DDD)** layering:

```
server/src/
  domain/user/          # User entity, IUserRepository interface, types
  infrastructure/       # SqliteUserRepository, schema, seed
  application/user/     # GetUsersUseCase, GetFacetsUseCase
  interface/http/       # UserController, routes

client/src/
  domain/user/          # Shared types (User, FacetItem, PagedResult, ...)
  application/api/      # fetch helpers (userApi.ts)
  application/hooks/    # useUsers, useFacets, useUrlState
  interface/components/ # UserCard, VirtualList, FilterSidebar, SortControls, SearchInput
  interface/pages/      # DirectoryPage
  app/                  # Next.js App Router entry (layout.tsx, page.tsx)
```

**Dependency direction**: `interface → application → domain ← infrastructure`

The domain layer has zero dependencies on framework or database code. `IUserRepository` is defined in the domain and implemented in the infrastructure layer, allowing the implementation to be swapped or mocked for testing.

---

## Code Style

- **TypeScript strict mode** throughout — no `any` except where the library type definitions require it (e.g. better-sqlite3 spread params)
- **No comments explaining what code does** — names are kept self-documenting; comments only appear for non-obvious constraints
- **Thin use cases** — `GetUsersUseCase` and `GetFacetsUseCase` are intentional thin wrappers; they exist to enforce the DDD boundary, not to add logic
- **Parameterized SQL only** — all user input goes through `?` placeholders; sort field uses a whitelist (`VALID_SORT_FIELDS`) since column names cannot be parameterized
- **Lodash debounce + useRef pattern** — the search debounce holds a stable function reference across renders while always reading the latest state via `stateRef.current`
- **Cancellation pattern** — each async fetch effect uses a `let cancelled = false` closure (not `useRef`) so each effect invocation manages its own cancel flag independently

---

## Data Model

```sql
users (id, avatar, first_name, last_name, age, nationality)
user_hobbies (user_id, hobby)   -- normalized, 0–10 hobbies per user
```

Hobbies are stored in a separate table to support efficient AND-semantics filtering:

```sql
-- Users who have ALL selected hobbies
WHERE u.id IN (
  SELECT user_id FROM user_hobbies
  WHERE hobby IN (?, ?)
  GROUP BY user_id
  HAVING COUNT(DISTINCT hobby) = 2
)
```

---

## API

### `GET /api/users`

Returns a paginated list of users.

**Query parameters**

| Param | Type | Default | Description |
|---|---|---|---|
| `search` | string | — | Case-insensitive match on first_name OR last_name |
| `nationalities` | comma-list | — | OR match — users from any listed nationality |
| `hobbies` | comma-list | — | AND match — users who have ALL listed hobbies |
| `sortField` | `first_name` \| `last_name` \| `age` \| `nationality` | `first_name` | Sort column |
| `sortDir` | `asc` \| `desc` | `asc` | Sort direction |
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Page size (max 100) |

**Response**
```json
{
  "data": [...],
  "total": 2000,
  "page": 1,
  "limit": 20,
  "hasMore": true
}
```

### `GET /api/facets`

Returns the top 20 nationalities and hobbies with user counts. Uses **disjunctive faceting**:
- Nationality counts apply search + hobby filters, but ignore the nationality filter (so all nationality options remain visible when one is selected)
- Hobby counts apply search + nationality filters, but ignore the hobby filter (so all hobby options remain visible when some are selected)

**Query parameters** — same filter params as `/api/users`

**Response**
```json
{
  "nationalities": [{ "value": "American", "count": 120 }, ...],
  "hobbies": [{ "value": "Gaming", "count": 340 }, ...]
}
```

---

## Running the app

### Docker (recommended)

```bash
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000). Database is seeded automatically on first run.

To reset: `docker compose down -v && docker compose up --build`

### Local (Node.js ≥ 20, npm ≥ 10)

```bash
npm install
npm run seed        # creates server/data/users.db with 2000 users
npm run dev:server  # API on :3001
npm run dev:client  # client on :3000
```

```bash
npm test            # run backend unit tests
```
