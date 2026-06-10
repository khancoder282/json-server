"use server"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { jsonStores, apiKeyJsonStores } from "@/lib/db/schema"
import { auth } from "@/auth"

const storeSchema = z.object({
  content: z.string().min(1, "Content is required"),
  isPublic: z.boolean(),
})

export async function createJsonStoreAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const contentStr = formData.get("content") as string
  try {
    JSON.parse(contentStr)
  } catch {
    return { success: false, error: "Invalid JSON content" }
  }

  const parsed = storeSchema.safeParse({
    content: contentStr,
    isPublic: formData.get("isPublic") === "true",
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const id = uuidv4()
  await db.insert(jsonStores).values({
    id,
    userId: session.user.id,
    name: id,
    content: parsed.data.content,
    isPublic: parsed.data.isPublic,
  })

  revalidatePath("/dashboard/json")
  return { success: true, id }
}

export async function updateJsonStoreAction(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const contentStr = formData.get("content") as string
  try {
    JSON.parse(contentStr)
  } catch {
    return { success: false, error: "Invalid JSON content" }
  }

  const parsed = storeSchema.safeParse({
    content: contentStr,
    isPublic: formData.get("isPublic") === "true",
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const [store] = await db
    .select()
    .from(jsonStores)
    .where(eq(jsonStores.id, id))
    .limit(1)

  if (!store || store.userId !== session.user.id) {
    return { success: false, error: "Not found" }
  }

  await db
    .update(jsonStores)
    .set({
      content: parsed.data.content,
      isPublic: parsed.data.isPublic,
      updatedAt: new Date(),
    })
    .where(eq(jsonStores.id, id))

  revalidatePath("/dashboard/json")
  return { success: true }
}

export async function deleteJsonStoreAction(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const [store] = await db
    .select()
    .from(jsonStores)
    .where(eq(jsonStores.id, id))
    .limit(1)

  if (!store || store.userId !== session.user.id) {
    return { success: false, error: "Not found" }
  }

  await db.delete(apiKeyJsonStores).where(eq(apiKeyJsonStores.jsonStoreId, id))
  await db.delete(jsonStores).where(eq(jsonStores.id, id))

  revalidatePath("/dashboard/json")
  return { success: true }
}
