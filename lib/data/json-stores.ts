"use server"
import { asc, count, desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { jsonStores } from "@/lib/db/schema"

const LIMIT = 10

type SortCol = "createdAt" | "isPublic"

// Lightweight list of every store the user owns — for the Playground switcher.
export async function getAllJsonStoresByUser(userId: string) {
  return db
    .select({
      id: jsonStores.id,
      name: jsonStores.name,
      isPublic: jsonStores.isPublic,
    })
    .from(jsonStores)
    .where(eq(jsonStores.userId, userId))
    .orderBy(desc(jsonStores.createdAt))
}

export async function getJsonStoresByUser(
  userId: string,
  page = 1,
  sort: SortCol = "createdAt",
  order: "asc" | "desc" = "desc"
) {
  const offset = (page - 1) * LIMIT
  const col = sort === "isPublic" ? jsonStores.isPublic : jsonStores.createdAt
  const orderFn = order === "asc" ? asc : desc

  const [{ total }] = await db
    .select({ total: count() })
    .from(jsonStores)
    .where(eq(jsonStores.userId, userId))

  const rows = await db
    .select()
    .from(jsonStores)
    .where(eq(jsonStores.userId, userId))
    .orderBy(orderFn(col))
    .limit(LIMIT)
    .offset(offset)

  return { rows, total, page, limit: LIMIT }
}

export async function getJsonStoreById(id: string) {
  const [store] = await db
    .select()
    .from(jsonStores)
    .where(eq(jsonStores.id, id))
    .limit(1)
  return store ?? null
}
