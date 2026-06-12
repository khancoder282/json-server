import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { db } from "@/lib/db"
import { jsonStores } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getApiKeyByKey, getLinkedStoreIds } from "@/lib/data/api-keys"
import { insertLog } from "@/lib/data/logs"
import { deepMerge } from "@/lib/utils/merge"
import { selectByPath } from "@/lib/utils/json-path"
import { checkRateLimit, rateLimitHeaders } from "@/lib/utils/rate-limit"

function getIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown"
}

function getUserAgent(req: NextRequest) {
  return req.headers.get("user-agent") ?? ""
}

async function log(
  req: NextRequest,
  action: string,
  result: "success" | "error",
  userId: string | null,
  requestBody: string | null,
  responseBody: string
) {
  await insertLog({
    id: uuidv4(),
    userId,
    action,
    result,
    ip: getIp(req),
    userAgent: getUserAgent(req),
    requestBody,
    responseBody,
  })
}

type StoreResult = {
  id: string
  name: string
  isPublic: boolean
  userId: string
  updatedAt: Date
  buildPayload: () => { ok: true; data: unknown } | { ok: false }
}

async function fetchStore(id: string, path: string | null): Promise<StoreResult | null> {
  const [row] = await db
    .select()
    .from(jsonStores)
    .where(eq(jsonStores.id, id))
    .limit(1)

  if (!row) return null

  return {
    ...row,
    buildPayload: () => {
      const content = JSON.parse(row.content)
      if (!path) return { ok: true, data: content }
      const result = selectByPath(content, path)
      return result.found ? { ok: true, data: result.value } : { ok: false }
    },
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const path = new URL(req.url).searchParams.get("path")
  const action = `GET /api/json/${id}${path ? `?path=${path}` : ""}`

  const store = await fetchStore(id, path)

  if (!store) {
    const body = JSON.stringify({ error: "Not found" })
    await log(req, action, "error", null, null, body)
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const { buildPayload } = store

  if (!store.isPublic) {
    const authHeader = req.headers.get("authorization")
    const bearerKey = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null

    if (!bearerKey) {
      const body = JSON.stringify({ error: "Unauthorized" })
      await log(req, action, "error", store.userId, null, body)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const apiKey = await getApiKeyByKey(bearerKey)
    if (
      !apiKey ||
      apiKey.userId !== store.userId ||
      !apiKey.permissions.includes("get")
    ) {
      const body = JSON.stringify({ error: "Unauthorized" })
      await log(req, action, "error", store.userId, null, body)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (apiKey.isLocked) {
      const body = JSON.stringify({ error: "API key is locked" })
      await log(req, action, "error", store.userId, null, body)
      return NextResponse.json({ error: "API key is locked" }, { status: 401 })
    }

    const linkedIds = await getLinkedStoreIds(apiKey.id)
    if (!linkedIds.includes(store.id)) {
      const body = JSON.stringify({ error: "Unauthorized" })
      await log(req, action, "error", store.userId, null, body)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ── Rate limit (private stores only — key required) ──
    const rl = checkRateLimit(apiKey.id)
    if (!rl.allowed) {
      const body = JSON.stringify({
        error: "Rate limit exceeded. Max 100 requests per minute per API key.",
      })
      await log(req, action, "error", store.userId, null, body)
      return NextResponse.json(
        {
          error:
            "Rate limit exceeded. Max 100 requests per minute per API key.",
        },
        { status: 429, headers: rateLimitHeaders(rl) }
      )
    }

    const payload = buildPayload()
    if (!payload.ok) {
      const body = JSON.stringify({ error: `Path not found: ${path}` })
      await log(req, action, "error", store.userId, null, body)
      return NextResponse.json(
        { error: `Path not found: ${path}` },
        { status: 404, headers: rateLimitHeaders(rl) }
      )
    }
    const resBody = JSON.stringify(payload.data)
    await log(req, action, "success", store.userId, null, resBody)
    return NextResponse.json(payload.data, { headers: rateLimitHeaders(rl) })
  }

  // Public store — no rate limit
  const payload = buildPayload()
  if (!payload.ok) {
    const body = JSON.stringify({ error: `Path not found: ${path}` })
    await log(req, action, "error", store.userId, null, body)
    return NextResponse.json(
      { error: `Path not found: ${path}` },
      { status: 404 }
    )
  }
  const body = JSON.stringify(payload.data)
  await log(req, action, "success", store.userId, null, body)
  return NextResponse.json(payload.data)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const action = `PUT /api/json/${id}`

  const authHeader = req.headers.get("authorization")
  const bearerKey = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null

  if (!bearerKey) {
    const body = JSON.stringify({ error: "Unauthorized" })
    await log(req, action, "error", null, null, body)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [store] = await db
    .select()
    .from(jsonStores)
    .where(eq(jsonStores.id, id))
    .limit(1)

  if (!store) {
    const body = JSON.stringify({ error: "Not found" })
    await log(req, action, "error", null, null, body)
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const apiKey = await getApiKeyByKey(bearerKey)
  if (
    !apiKey ||
    apiKey.userId !== store.userId ||
    !apiKey.permissions.includes("put")
  ) {
    const body = JSON.stringify({ error: "Unauthorized" })
    await log(req, action, "error", store.userId, null, body)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (apiKey.isLocked) {
    const body = JSON.stringify({ error: "API key is locked" })
    await log(req, action, "error", store.userId, null, body)
    return NextResponse.json({ error: "API key is locked" }, { status: 401 })
  }

  const linkedIds = await getLinkedStoreIds(apiKey.id)
  if (!linkedIds.includes(store.id)) {
    const body = JSON.stringify({ error: "Unauthorized" })
    await log(req, action, "error", store.userId, null, body)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // ── Rate limit ──────────────────────────────────────────
  const rl = checkRateLimit(apiKey.id)
  if (!rl.allowed) {
    const body = JSON.stringify({
      error: "Rate limit exceeded. Max 100 requests per minute per API key.",
    })
    await log(req, action, "error", store.userId, null, body)
    return NextResponse.json(
      {
        error: "Rate limit exceeded. Max 100 requests per minute per API key.",
      },
      { status: 429, headers: rateLimitHeaders(rl) }
    )
  }

  let incoming: Record<string, unknown>
  let rawBody: string
  try {
    rawBody = await req.text()
    incoming = JSON.parse(rawBody)
  } catch {
    const body = JSON.stringify({ error: "Invalid JSON body" })
    await log(req, action, "error", store.userId, null, body)
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const existing = JSON.parse(store.content) as Record<string, unknown>
  const merged = deepMerge(existing, incoming)
  const mergedStr = JSON.stringify(merged)
  const now = new Date()

  await db
    .update(jsonStores)
    .set({ content: mergedStr, updatedAt: now })
    .where(eq(jsonStores.id, id))

  const resBody = JSON.stringify(merged)
  await log(req, action, "success", store.userId, rawBody, resBody)
  return NextResponse.json(merged, { headers: rateLimitHeaders(rl) })
}
