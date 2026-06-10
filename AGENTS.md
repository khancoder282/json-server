<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Project-specific rules

## proxy.ts (NOT middleware.ts)

`middleware.ts` is **deprecated and removed** in Next.js 16. The file is now `proxy.ts`.

- Named export must be `proxy` (not `middleware` or `default`)
- Having **both** `middleware.ts` and `proxy.ts` causes a build error — never create `middleware.ts`
- Read `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` for full API

```ts
// proxy.ts — correct
export const proxy = auth

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

## NextAuth in proxy.ts must be edge-compatible

`proxy.ts` runs on the **Edge Runtime** — it cannot use Node.js APIs (bcrypt, Drizzle, mysql2).

- Use `NextAuth(authConfig).auth` from the edge-compatible `auth.config.ts` (no DB/bcrypt imports)
- Never import `{ auth } from "@/auth"` inside `proxy.ts` — that pulls in bcrypt + Drizzle and crashes

```ts
// proxy.ts — correct
import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
export const proxy = NextAuth(authConfig).auth
```

## Server Actions must NOT be called from useEffect

In React 19 / Next.js 15+, calling Server Actions from `useEffect` causes errors (e.g. `setStatus("verifying")` side-effects, state updates outside React's expected flow).

**Wrong:**
```tsx
useEffect(() => {
  verifyEmailAction(token).then(...)  // ❌
}, [token])
```

**Correct patterns:**
- Handle in the **Server Component** (page.tsx) using `await action()` + `redirect()`
- Call from **event handlers** (onClick, form action)
- Call from `startTransition` in response to user interaction
