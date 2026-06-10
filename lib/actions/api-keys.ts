"use server"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { apiKeys, apiKeyJsonStores } from "@/lib/db/schema"
import { auth } from "@/auth"
import { generateApiKey } from "@/lib/utils/crypto"

const keySchema = z.object({
  permissions: z.string().min(1, "Select at least one permission"),
  storeIds: z.array(z.string()),
})

export async function createApiKeyAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const perms = [formData.get("perm_get") === "get" ? "get" : "", formData.get("perm_put") === "put" ? "put" : ""]
    .filter(Boolean)
    .join(",")

  const storeIds = formData.getAll("storeIds") as string[]

  const parsed = keySchema.safeParse({
    permissions: perms || "",
    storeIds,
  })
  if (!parsed.success || !parsed.data.permissions) {
    return { success: false, error: "Select at least one permission" }
  }

  const key = generateApiKey()
  const id = uuidv4()

  await db.insert(apiKeys).values({
    id,
    userId: session.user.id,
    name: id,
    key,
    permissions: parsed.data.permissions,
  })

  if (storeIds.length > 0) {
    await db.insert(apiKeyJsonStores).values(
      storeIds.map((sid) => ({ apiKeyId: id, jsonStoreId: sid })),
    )
  }

  revalidatePath("/dashboard/keys")
  return { success: true, key }
}

export async function updateApiKeyAction(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const [existing] = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.id, id))
    .limit(1)
  if (!existing || existing.userId !== session.user.id) {
    return { success: false, error: "Not found" }
  }

  const perms = [formData.get("perm_get") === "get" ? "get" : "", formData.get("perm_put") === "put" ? "put" : ""]
    .filter(Boolean)
    .join(",")

  const storeIds = formData.getAll("storeIds") as string[]

  const parsed = keySchema.safeParse({
    permissions: perms || "",
    storeIds,
  })
  if (!parsed.success || !parsed.data.permissions) {
    return { success: false, error: "Select at least one permission" }
  }

  await db
    .update(apiKeys)
    .set({ permissions: parsed.data.permissions })
    .where(eq(apiKeys.id, id))

  await db.delete(apiKeyJsonStores).where(eq(apiKeyJsonStores.apiKeyId, id))
  if (storeIds.length > 0) {
    await db.insert(apiKeyJsonStores).values(
      storeIds.map((sid) => ({ apiKeyId: id, jsonStoreId: sid })),
    )
  }

  revalidatePath("/dashboard/keys")
  return { success: true }
}

export async function deleteApiKeyAction(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const [existing] = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.id, id))
    .limit(1)
  if (!existing || existing.userId !== session.user.id) {
    return { success: false, error: "Not found" }
  }

  await db.delete(apiKeyJsonStores).where(eq(apiKeyJsonStores.apiKeyId, id))
  await db.delete(apiKeys).where(eq(apiKeys.id, id))

  revalidatePath("/dashboard/keys")
  return { success: true }
}
