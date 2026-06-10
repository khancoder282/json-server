# JSON Server — Full Specification

## Tech Stack

- **Runtime:** Bun
- **Framework:** Next.js 15 App Router
- **UI:** shadcn/ui — reuse components aggressively, split new ones into small focused components
- **Auth:** NextAuth v5
- **ORM:** Drizzle ORM
- **Database:** MySQL at `root:root@localhost:3303/json-server`
- **Email:** Resend
- **Code Editor:** `@monaco-editor/react`
- **Language:** English (all UI, code, comments)
- **Responsive:** Desktop and mobile friendly

## Architecture Rules

- Server-side data logic must be isolated in dedicated server functions (e.g. `lib/data/`, `lib/actions/`)
- Prefer Next.js Server Actions (`action.ts`) and `<form>` for mutations
- Components must be small and reusable — never duplicate UI logic
- All DB schema defined and migrated via Drizzle ORM

---

## Database Schema (Drizzle)

### `users`

| Column         | Type      | Notes         |
| -------------- | --------- | ------------- |
| id             | uuid      | primary key   |
| name           | varchar   |               |
| email          | varchar   | unique        |
| password       | varchar   | hashed        |
| email_verified | boolean   | default false |
| created_at     | timestamp |               |

### `verification_tokens`

| Column     | Type      | Notes       |
| ---------- | --------- | ----------- |
| id         | uuid      | primary key |
| user_id    | uuid      | FK → users  |
| token      | varchar   | unique      |
| expires_at | timestamp | now + 24h   |
| created_at | timestamp |             |

### `json_stores`

| Column     | Type      | Notes         |
| ---------- | --------- | ------------- |
| id         | uuid      | primary key   |
| user_id    | uuid      | FK → users    |
| name       | varchar   | display name  |
| content    | longtext  | JSON string   |
| is_public  | boolean   | default false |
| created_at | timestamp |               |
| updated_at | timestamp |               |

### `api_keys`

| Column      | Type      | Notes                                          |
| ----------- | --------- | ---------------------------------------------- |
| id          | uuid      | primary key                                    |
| user_id     | uuid      | FK → users                                     |
| name        | varchar   | label for the key                              |
| key         | varchar   | unique, format: `json-server-xxxxxxxxxxxxxxxx` |
| permissions | varchar   | `get`, `put`, or `get,put`                     |
| created_at  | timestamp |                                                |

### `api_key_json_stores` (pivot)

| Column        | Type | Notes            |
| ------------- | ---- | ---------------- |
| api_key_id    | uuid | FK → api_keys    |
| json_store_id | uuid | FK → json_stores |

### `logs`

| Column        | Type      | Notes                     |
| ------------- | --------- | ------------------------- |
| id            | uuid      | primary key               |
| user_id       | uuid      | nullable, FK → users      |
| action        | varchar   | e.g. `GET /api/json/{id}` |
| result        | varchar   | `success` / `error`       |
| ip            | varchar   |                           |
| user_agent    | text      |                           |
| request_body  | longtext  | nullable                  |
| response_body | longtext  | nullable                  |
| created_at    | timestamp |                           |

---

## Auth Flow

### Register (`/register`)

1. User fills in name, email, password
2. Server Action creates user (password hashed), generates verification token (expires in 24h), sends email via Resend with verify link
3. Redirect to `/verify-email?email=...`

### Verify Email page (`/verify-email`)

- Shows "Check your inbox" message
- Has **Resend Email** button (Server Action: invalidates old token, creates new one, resends email)
- Visiting `/verify-email?token=xxx`:
  - Validates token exists and not expired
  - Marks `email_verified = true`, deletes token
  - Auto-redirects to `/dashboard`
  - If token expired: show error + resend button

### Login (`/login`)

1. NextAuth v5 Credentials provider
2. If `email_verified = false` → redirect to `/verify-email?email=...`
3. If verified → redirect to `/dashboard`

### Middleware

- Protect all `/dashboard/*` routes — redirect to `/login` if unauthenticated
- Redirect authenticated users away from `/login` and `/register`

---

## Dashboard Layout

### Shell

- Sidebar (desktop) / bottom nav or hamburger (mobile)
- Header: user avatar, name, email, **Sign Out** button
- Navigation menu:
  - JSON Management
  - Key Management
  - Log Management

### Dashboard Home (`/dashboard`)

- User info card: name, email, verified badge, joined date
- Stats: total JSON stores, total API keys, total API calls (from logs)

---

## Feature: JSON Management (`/dashboard/json`)

### List view

- Table/card list of all JSON stores: name, visibility badge (Public/Private), created date, actions
- **Create New** button

### Create / Edit (`/dashboard/json/new`, `/dashboard/json/[id]/edit`)

- Form fields: Name, Visibility toggle (Public/Private)
- Monaco Editor (`@monaco-editor/react`) for JSON content with:
  - JSON syntax highlighting
  - Validate JSON before save — block submission if invalid
  - Format/prettify button
- Server Action to create/update record in DB

### Delete

- Confirmation dialog
- Server Action deletes record and all related `api_key_json_stores` rows

---

## Feature: Key Management (`/dashboard/keys`)

### List view

- Table: key name, masked key value (`json-server-xxxx...****`), permissions badge, linked JSON count, created date, actions
- **Create New Key** button

### Create Key form

- Fields:
  - Key name (label)
  - Permissions: checkbox group — `GET`, `PUT`
  - Link to JSON stores: multi-select of user's JSON stores
- On submit: generate key string (`json-server-` + 16+ random hex chars), save to DB with pivot rows
- Show full key **once** after creation (copy-to-clipboard button), warn it will not be shown again

### Edit Key

- Can change: name, permissions, linked JSON stores
- Cannot change: key string itself

### Delete Key

- Confirmation dialog, removes key and pivot rows

---

## Feature: Log Management (`/dashboard/logs`)

### List view

- Table with columns: Time, Action, Result (badge), IP, User Agent (truncated), Request Body (expandable), Response Body (expandable)
- Filters: date range, action, result (success/error)
- Pagination

### Manual Delete

- **Clear All Logs** button with confirmation dialog (Server Action)
- Optional: delete logs older than N days

### Auto-delete (Bun Cron)

- Standalone Bun script at `scripts/cron.ts`
- Runs weekly: deletes all log rows older than 7 days
- Register as a Bun cron task

---

## Public API (no login required)

All API routes live under `/app/api/json/[id]/route.ts`.
Every request is logged to the `logs` table regardless of outcome.

### `GET /api/json/{id}`

**Logic:**

1. Look up `json_stores` by `id`
2. If not found → `404 { error: "Not found" }`
3. If `is_public = true` → return `200 { id, name, content (parsed JSON) }`
4. If `is_public = false`:
   - Require header: `Authorization: Bearer <key>`
   - Validate key exists, has `get` permission, and is linked to this JSON store
   - If invalid → `401 { error: "Unauthorized" }`
   - If valid → return `200 { id, name, content (parsed JSON) }`

**Response:**

```json
{
  "id": "uuid",
  "name": "store name",
  "content": { ...parsed json... },
  "updated_at": "ISO timestamp"
}
```

### `PUT /api/json/{id}`

**Logic:**

1. Require header: `Authorization: Bearer <key>`
2. Look up `json_stores` by `id`
3. If not found → `404`
4. Validate key: exists, has `put` permission, linked to this JSON store
5. If invalid → `401`
6. Parse request body as JSON — if invalid JSON → `400 { error: "Invalid JSON body" }`
7. **Deep merge** request body into existing `content` (recursive merge of nested objects; arrays are replaced not merged)
8. Save updated content, update `updated_at`
9. Return `200 { id, name, content (merged result), updated_at }`

**Deep merge rule:**

- Objects: recursively merge keys
- Arrays / primitives: incoming value overwrites existing

---

## Email Templates (Resend)

### Verify Email

- Subject: `Verify your JSON Server account`
- Body: greeting, verify button linking to `/verify-email?token=xxx`, note that link expires in 24 hours
- Clean, minimal HTML template

---

## Error Handling

- All Server Actions return typed results: `{ success: true, data? }` or `{ success: false, error: string }`
- API routes return standard HTTP status codes with JSON error bodies
- Form validation with `zod` on both client and server

## File Structure (suggested)

```
app/
  (auth)/
    login/
    register/
    verify-email/
  (dashboard)/
    dashboard/
      page.tsx               ← stats + user info
      json/
      keys/
      logs/
  api/
    json/[id]/route.ts
lib/
  db/
    schema.ts                ← Drizzle schema
    index.ts                 ← DB client
  data/
    json-stores.ts           ← server data functions
    api-keys.ts
    logs.ts
    users.ts
  actions/
    auth.ts
    json-stores.ts
    api-keys.ts
    logs.ts
  email/
    templates/
    resend.ts
  utils/
    merge.ts                 ← deep merge logic
    crypto.ts                ← key generation
scripts/
  cron.ts                    ← Bun weekly log cleanup
components/
  ui/                        ← shadcn primitives
  shared/                    ← reusable app components
  json/
  keys/
  logs/
```
