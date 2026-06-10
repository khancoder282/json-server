"use server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import {
  users,
  jsonStores,
  apiKeys,
  apiKeyJsonStores,
  logs,
  verificationTokens,
} from "@/lib/db/schema"
import { auth, signOut } from "@/auth"

export async function updateProfileAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const name = (formData.get("name") as string)?.trim()
  if (!name || name.length < 2)
    return { success: false, error: "Name must be at least 2 characters" }

  await db.update(users).set({ name }).where(eq(users.id, session.user.id))
  revalidatePath("/dashboard/profile")
  return { success: true }
}

export async function updatePasswordAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const parsed = z
    .object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z.string().min(8, "New password must be at least 8 characters"),
      confirmPassword: z.string(),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    })
    .safeParse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    })

  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)
  if (!user) return { success: false, error: "User not found" }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.password)
  if (!valid) return { success: false, error: "Current password is incorrect" }

  const hashed = await bcrypt.hash(parsed.data.newPassword, 10)
  await db.update(users).set({ password: hashed }).where(eq(users.id, session.user.id))

  return { success: true }
}

export async function deleteAccountAction() {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const userId = session.user.id

  const userKeys = await db
    .select({ id: apiKeys.id })
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId))

  for (const key of userKeys) {
    await db.delete(apiKeyJsonStores).where(eq(apiKeyJsonStores.apiKeyId, key.id))
  }

  const userStores = await db
    .select({ id: jsonStores.id })
    .from(jsonStores)
    .where(eq(jsonStores.userId, userId))

  for (const store of userStores) {
    await db.delete(apiKeyJsonStores).where(eq(apiKeyJsonStores.jsonStoreId, store.id))
  }

  await db.delete(logs).where(eq(logs.userId, userId))
  await db.delete(apiKeys).where(eq(apiKeys.userId, userId))
  await db.delete(jsonStores).where(eq(jsonStores.userId, userId))
  await db.delete(verificationTokens).where(eq(verificationTokens.userId, userId))
  await db.delete(users).where(eq(users.id, userId))

  await signOut({ redirectTo: "/login" })
}
