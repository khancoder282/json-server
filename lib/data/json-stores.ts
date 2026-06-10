"use server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { jsonStores } from "@/lib/db/schema"

export async function getJsonStoresByUser(userId: string) {
  return db.select().from(jsonStores).where(eq(jsonStores.userId, userId))
}

export async function getJsonStoreById(id: string) {
  const [store] = await db
    .select()
    .from(jsonStores)
    .where(eq(jsonStores.id, id))
    .limit(1)
  return store ?? null
}
