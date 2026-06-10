"use server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { users, verificationTokens } from "@/lib/db/schema"

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  return user ?? null
}

export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return user ?? null
}

export async function getVerificationToken(token: string) {
  const [row] = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.token, token))
    .limit(1)
  return row ?? null
}
