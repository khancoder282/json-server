"use server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { apiKeys, apiKeyJsonStores, jsonStores } from "@/lib/db/schema"

export async function getApiKeysByUser(userId: string) {
  const keys = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId))

  const result = await Promise.all(
    keys.map(async (key) => {
      const linked = await db
        .select({ jsonStoreId: apiKeyJsonStores.jsonStoreId })
        .from(apiKeyJsonStores)
        .where(eq(apiKeyJsonStores.apiKeyId, key.id))
      return { ...key, linkedCount: linked.length }
    }),
  )
  return result
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
