"use server"
import { eq, lt } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { logs } from "@/lib/db/schema"
import { auth } from "@/auth"

export async function clearAllLogsAction() {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  await db.delete(logs).where(eq(logs.userId, session.user.id))
  revalidatePath("/dashboard/logs")
  return { success: true }
}

export async function deleteOldLogsAction(userId: string, daysOld: number) {
  const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)
  await db.delete(logs).where(lt(logs.createdAt, cutoff))
}
