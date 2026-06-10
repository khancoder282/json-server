import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { db } from "@/lib/db"
import { jsonStores } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getApiKeyByKey, getLinkedStoreIds } from "@/lib/data/api-keys"
import { insertLog } from "@/lib/data/logs"
import { deepMerge } from "@/lib/utils/merge"

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const action = `GET /api/json/${id}`

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

    const linkedIds = await getLinkedStoreIds(apiKey.id)
    if (!linkedIds.includes(store.id)) {
      const body = JSON.stringify({ error: "Unauthorized" })
      await log(req, action, "error", store.userId, null, body)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const responseData = JSON.parse(store.content);
  const body = JSON.stringify(responseData)
  await log(req, action, "success", store.userId, null, body)
  return NextResponse.json(responseData)
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

  const linkedIds = await getLinkedStoreIds(apiKey.id)
  if (!linkedIds.includes(store.id)) {
    const body = JSON.stringify({ error: "Unauthorized" })
    await log(req, action, "error", store.userId, null, body)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
  return NextResponse.json(merged)
}
