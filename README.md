# User Directory

Full-stack user directory with search, filtering, infinite scroll, and URL-synced state.

**Stack**: Next.js 15 (App Router) · Node.js + Express 5 · SQLite (better-sqlite3) · Tailwind CSS v4 · @tanstack/react-virtual · TypeScript · DDD architecture

---

## Architecture

```
server/src/
  domain/user/          ← entities & repository interface
  infrastructure/       ← SqliteUserRepository, schema, seed
  application/user/     ← GetUsersUseCase, GetFacetsUseCase
  interface/http/       ← UserController, routes

client/src/
  domain/user/          ← shared types
  application/api/      ← fetch helpers
  application/hooks/    ← useUsers, useFacets, useUrlState, useDebounce
  interface/components/ ← UserCard, VirtualList, FilterSidebar, SortControls, SearchInput
  app/                  ← Next.js App Router (layout.tsx, page.tsx)
```

---

## Local Setup

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10

### 1. Install dependencies

```bash
npm install
```

### 2. Seed the database

```bash
npm run seed
# Creates ./server/data/users.db with 2000 users
```

### 3. Run in development

Open two terminals:

```bash
# Terminal 1 — API server (port 3001)
npm run dev:server

# Terminal 2 — Next.js client (port 3000)
npm run dev:client
```

Open [http://localhost:3000](http://localhost:3000)

---

## Docker Compose

```bash
docker compose up --build
```

- Seeds the database automatically on first run (skips if already seeded)
- Client: [http://localhost:3000](http://localhost:3000)
- API: internal only (proxied through Next.js rewrites)

To reset the database: `docker compose down -v && docker compose up --build`

---

## API

| Endpoint | Description |
|---|---|
| `GET /api/users` | Paginated users |
| `GET /api/facets` | Top 20 nationalities + hobbies |

**Query params (both endpoints)**

| Param | Type | Description |
|---|---|---|
| `search` | string | Filters first_name OR last_name (case-insensitive) |
| `nationalities` | comma-list | OR match across selected nationalities |
| `hobbies` | comma-list | AND match — user must have ALL selected hobbies |
| `sortField` | `first_name` \| `last_name` \| `age` \| `nationality` | Default: `first_name` |
| `sortDir` | `asc` \| `desc` | Default: `asc` |
| `page` | integer | Default: `1` |
| `limit` | integer | Default: `20`, max `100` |
