<div align="center">

<img src="./public/screenshots/frame-1-hero-light.webp" alt="JSON Server Dashboard" width="800" />

<br />
<br />

# JSON Server

**Your personal JSON storage API**

A full-stack web application for storing, managing, and serving JSON data via a simple REST API.  
Create stores, issue scoped API keys, and track every request — all in one place.

<br />

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06b6d4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Bun](https://img.shields.io/badge/Bun-runtime-f9f1e1?style=flat-square&logo=bun)](https://bun.sh)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](./LICENSE)

<br />

[Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
- [API Reference](#api-reference)
  - [GET /api/json/:id](#get-apijsonid)
  - [PUT /api/json/:id](#put-apijsonid)
  - [Rate Limiting](#rate-limiting)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Screenshots](#screenshots)
- [Learning Goals](#learning-goals)
- [License](#license)

---

## Overview

JSON Server is a hands-on learning project that demonstrates the architecture of a modern, production-grade full-stack web application. It covers the complete lifecycle of a real-world API service — from user authentication and data management to access control and request logging.

The project is intentionally kept simple and readable, making it ideal for developers learning how to build full-stack applications with the modern Next.js App Router paradigm.

---

## Features

- **JSON Stores** — Create and manage named JSON data stores with a built-in code editor (syntax highlighting, validation, auto-format)
- **Public / Private visibility** — Toggle each store between public (no auth) and private (API key required)
- **Deep merge on PUT** — Incoming JSON is recursively merged into existing content; arrays are replaced
- **API Key management** — Issue scoped keys with `get`, `put`, or `get,put` permissions, linked to specific stores
- **Access Logs** — Every API call is logged with timestamp, IP, user agent, and full request/response body
- **Email verification** — Registration requires email confirmation via Resend before first login
- **Rate limiting** — 100 requests per minute per API key (sliding window)
- **Dark / Light mode** — Full theme support with instant switching
- **Responsive** — Works on desktop and mobile

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **UI** | React 19, Tailwind CSS v4, shadcn/ui, Base UI |
| **Language** | TypeScript 5 |
| **Auth** | NextAuth v5 (Credentials + email verification) |
| **ORM** | Drizzle ORM |
| **Database** | MySQL 8 |
| **Email** | Resend |
| **Runtime** | Bun |
| **Animation** | Motion (Framer Motion v12) |
| **Editor** | CodeMirror (JSON) |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) ≥ 1.0
- MySQL 8 instance (local or remote)
- [Resend](https://resend.com) account for transactional email

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/json-server.git
cd json-server

# Install dependencies
bun install
```

### Environment Variables

Create a `.env.local` file in the root of the project:

```env
# Database
DATABASE_URL="mysql://root:password@localhost:3306/json-server"

# NextAuth
AUTH_SECRET="your-secret-key-min-32-chars"
AUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST=true

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxx"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | MySQL connection string |
| `AUTH_SECRET` | Random string ≥ 32 characters — used to sign sessions |
| `AUTH_URL` | Public base URL of the app |
| `AUTH_TRUST_HOST` | Set to `true` when running behind a proxy or on localhost |
| `RESEND_API_KEY` | API key from [resend.com](https://resend.com) |
| `NEXT_PUBLIC_APP_URL` | Used to build verify-email links sent via email |

### Database Setup

```bash
# Push schema to database (creates all tables)
bun run db:push

# Optional: open Drizzle Studio to browse data visually
bun run db:studio
```

### Running

```bash
# Development
bun run dev

# Production build + start
bun run build
bun run start

# Weekly log cleanup cron (optional, runs in background)
bun run cron
```

---

## API Reference

All API routes are under `/api/json/[id]`. Every request — successful or not — is logged to the `logs` table.

### GET /api/json/:id

Retrieve a JSON store by ID.

**Public store** — no authentication required:

```http
GET /api/json/ef1b0011-1fad-4f67-a17b-fcff2fe42875
```

**Private store** — API key with `get` permission required:

```http
GET /api/json/ef1b0011-1fad-4f67-a17b-fcff2fe42875
Authorization: Bearer json-server-xxxxxxxxxxxxxxxx
```

**Success response `200 OK`:**

```json
{
  "id": "ef1b0011-1fad-4f67-a17b-fcff2fe42875",
  "name": "My Store",
  "content": { "key": "value" },
  "updated_at": "2025-06-11T03:00:00.000Z"
}
```

**Error responses:**

| Status | Reason |
|---|---|
| `401 Unauthorized` | Missing or invalid API key / insufficient permissions |
| `404 Not Found` | Store ID does not exist |
| `429 Too Many Requests` | Rate limit exceeded |

---

### PUT /api/json/:id

Deep-merge new data into an existing JSON store. Always requires an API key with `put` permission.

```http
PUT /api/json/ef1b0011-1fad-4f67-a17b-fcff2fe42875
Authorization: Bearer json-server-xxxxxxxxxxxxxxxx
Content-Type: application/json

{
  "user": { "name": "Alice" }
}
```

**Deep merge rules:**

| Type | Behavior |
|---|---|
| Object | Keys are recursively merged |
| Array | Incoming value **replaces** existing |
| Primitive | Incoming value **replaces** existing |

**Example:**

```jsonc
// Existing content
{ "user": { "name": "Bob", "age": 30 }, "tags": ["a", "b"] }

// PUT body
{ "user": { "name": "Alice" }, "tags": ["c"] }

// Resulting content
{ "user": { "name": "Alice", "age": 30 }, "tags": ["c"] }
```

**Success response `200 OK`:** full merged content (same shape as GET response)

**Error responses:**

| Status | Reason |
|---|---|
| `400 Bad Request` | Request body is not valid JSON |
| `401 Unauthorized` | Missing, invalid, or insufficient-permission API key |
| `404 Not Found` | Store ID does not exist |
| `429 Too Many Requests` | Rate limit exceeded |

---

### Rate Limiting

Authenticated requests (private GET and all PUT) are rate-limited to **100 requests per minute per API key**, using a sliding window algorithm.

Every authenticated response includes these headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 94
X-RateLimit-Reset: 2025-06-11T04:01:00.000Z
```

When the limit is exceeded (`429`):

```http
Retry-After: 42
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2025-06-11T04:01:00.000Z
```

```json
{
  "error": "Rate limit exceeded. Max 100 requests per minute per API key."
}
```

> **Note:** Public GET stores are not rate-limited. Only API-key-authenticated requests count toward the limit.

---

## Project Structure

```
json-server/
├── app/
│   ├── (auth)/              # Login, register, verify-email pages
│   ├── (dashboard)/         # Protected dashboard pages
│   │   └── dashboard/
│   │       ├── json/        # JSON store CRUD + Monaco editor
│   │       ├── keys/        # API key management
│   │       ├── logs/        # Paginated, filterable log viewer
│   │       └── settings/    # Profile, password, theme
│   ├── api/
│   │   └── json/[id]/       # Public REST API — GET + PUT
│   ├── layout.tsx
│   └── page.tsx             # Marketing / landing page
│
├── components/
│   ├── ui/                  # shadcn/ui primitives
│   ├── shared/              # Reusable app-level components
│   ├── json/                # JSON store UI components
│   ├── keys/                # API key UI components
│   └── logs/                # Log table and filter components
│
├── lib/
│   ├── actions/             # Next.js Server Actions (mutations)
│   ├── data/                # Server-side data access functions
│   ├── db/                  # Drizzle client + schema definitions
│   ├── email/               # Resend templates
│   └── utils/               # merge, crypto, rate-limit
│
├── scripts/
│   ├── cron.ts              # Weekly log cleanup (Bun cron)
│   └── screenshots.ts       # Automated screenshot capture (Playwright)
│
└── public/
    └── screenshots/         # App screenshots — light + dark WebP
```

---

## Database Schema

```
users ──────────────────────── json_stores
  │                                │
  ├── verification_tokens          │
  ├── api_keys ─────── api_key_json_stores
  └── logs
```

| Table | Purpose |
|---|---|
| `users` | Registered accounts (name, email, hashed password) |
| `verification_tokens` | Email verification tokens — expire in 24 hours |
| `json_stores` | JSON data stores (content stored as longtext) |
| `api_keys` | API keys with `get`, `put`, or `get,put` permissions |
| `api_key_json_stores` | Many-to-many join: keys ↔ stores |
| `logs` | Full audit log of every API request |

---

## Screenshots

<table>
  <tr>
    <th>Light mode</th>
    <th>Dark mode</th>
  </tr>
  <tr>
    <td><img src="./public/screenshots/frame-2-dashboard-light.webp" alt="Dashboard light" /></td>
    <td><img src="./public/screenshots/frame-2-dashboard-dark.webp" alt="Dashboard dark" /></td>
  </tr>
  <tr>
    <td><img src="./public/screenshots/frame-6-json-editor-light.webp" alt="JSON editor light" /></td>
    <td><img src="./public/screenshots/frame-6-json-editor-dark.webp" alt="JSON editor dark" /></td>
  </tr>
  <tr>
    <td><img src="./public/screenshots/frame-5-logs-light.webp" alt="Logs light" /></td>
    <td><img src="./public/screenshots/frame-5-logs-dark.webp" alt="Logs dark" /></td>
  </tr>
</table>

---

## Learning Goals

This project is structured to teach the following concepts through a real working application:

| # | Concept | What you'll learn |
|---|---|---|
| 01 | **REST API Design** | HTTP methods, status codes, JSON response structure, deep-merge logic |
| 02 | **Authentication** | Registration flow, email verification, credential login, session middleware |
| 03 | **Access Control** | API key generation, scoped permissions, resource-level authorization |
| 04 | **Database & ORM** | Schema design, relationships, migrations, type-safe queries with Drizzle |
| 05 | **Server Components** | App Router data fetching, Server Actions, mixing server and client rendering |
| 06 | **Audit Logging** | Capturing request metadata, building filterable log viewers |
| 07 | **Rate Limiting** | Sliding window algorithm, standard `X-RateLimit-*` response headers |
| 08 | **Email Flows** | Transactional email with Resend, token-based email verification |

---

## License

MIT © 2025 [Khan Trần](mailto:datakcoder282@gmail.com)
