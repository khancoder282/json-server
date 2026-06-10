"use server"
import { asc, count, desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { apiKeys, apiKeyJsonStores, jsonStores } from "@/lib/db/schema"

const LIMIT = 10

type SortCol = "createdAt" | "permissions"

export async function getApiKeysByUser(
  userId: string,
  page = 1,
  sort: SortCol = "createdAt",
  order: "asc" | "desc" = "desc",
) {
  const offset = (page - 1) * LIMIT
  const col = sort === "permissions" ? apiKeys.permissions : apiKeys.createdAt
  const orderFn = order === "asc" ? asc : desc

  const [{ total }] = await db
    .select({ total: count() })
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId))

  const keys = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId))
    .orderBy(orderFn(col))
    .limit(LIMIT)
    .offset(offset)

  const result = await Promise.all(
    keys.map(async (key) => {
      const linked = await db
        .select({ jsonStoreId: apiKeyJsonStores.jsonStoreId })
        .from(apiKeyJsonStores)
        .where(eq(apiKeyJsonStores.apiKeyId, key.id))
      return {
        ...key,
        linkedCount: linked.length,
        linkedStoreIds: linked.map((r) => r.jsonStoreId),
      }
    }),
  )

  return { rows: result, total, page, limit: LIMIT }
}

export async function getApiKeyByKey(keyStr: string) {
  const [key] = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.key, keyStr))
    .limit(1)
  return key ?? null
}

export async function getLinkedStoreIds(apiKeyId: string) {
  const rows = await db
    .select({ jsonStoreId: apiKeyJsonStores.jsonStoreId })
    .from(apiKeyJsonStores)
    .where(eq(apiKeyJsonStores.apiKeyId, apiKeyId))
  return rows.map((r) => r.jsonStoreId)
}

export async function getApiKeyWithStores(id: string) {
  const [key] = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.id, id))
    .limit(1)
  if (!key) return null

  const linked = await db
    .select({ jsonStoreId: apiKeyJsonStores.jsonStoreId })
    .from(apiKeyJsonStores)
    .where(eq(apiKeyJsonStores.apiKeyId, id))

  return { ...key, linkedStoreIds: linked.map((r) => r.jsonStoreId) }
}
