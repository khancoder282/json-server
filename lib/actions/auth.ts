"use server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { users, verificationTokens } from "@/lib/db/schema"
import { getUserByEmail, getVerificationToken } from "@/lib/data/users"
import { resend } from "@/lib/email/resend"
import { verifyEmailTemplate } from "@/lib/email/templates/verify-email"
import { signIn, signOut } from "@/auth"

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

async function sendVerificationEmail(userId: string, email: string, name: string) {
  await db.delete(verificationTokens).where(eq(verificationTokens.userId, userId))

  const token = uuidv4().replace(/-/g, "") + uuidv4().replace(/-/g, "")
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await db.insert(verificationTokens).values({
    id: uuidv4(),
    userId,
    token,
    expiresAt,
  })

  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`
  await resend.emails.send({
    from: "JSON Server <onboarding@resend.dev>",
    to: email,
    subject: "Verify your JSON Server account",
    html: verifyEmailTemplate(name, verifyUrl),
  })

  return token
}

export async function registerAction(formData: FormData) {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const { name, email, password } = parsed.data

  const existing = await getUserByEmail(email)
  if (existing) {
    return { success: false, error: "Email already in use" }
  }

  const hashed = await bcrypt.hash(password, 10)
  const userId = uuidv4()

  await db.insert(users).values({
    id: userId,
    name,
    email,
    password: hashed,
    emailVerified: false,
  })

  await sendVerificationEmail(userId, email, name)

  return { success: true, email }
}

export async function resendVerificationAction(email: string) {
  const user = await getUserByEmail(email)
  if (!user) return { success: false, error: "User not found" }
  if (user.emailVerified) return { success: false, error: "Email already verified" }

  await sendVerificationEmail(user.id, user.email, user.name)
  return { success: true }
}

export async function verifyEmailAction(token: string) {
  const row = await getVerificationToken(token)
  if (!row) return { success: false, error: "Invalid token" }
  if (row.expiresAt < new Date()) {
    return { success: false, error: "Token expired" }
  }

  await db.update(users).set({ emailVerified: true }).where(eq(users.id, row.userId))
  await db.delete(verificationTokens).where(eq(verificationTokens.id, row.id))

  return { success: true }
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const user = await getUserByEmail(email)
  if (!user) return { success: false, error: "Invalid credentials" }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return { success: false, error: "Invalid credentials" }

  if (!user.emailVerified) {
    return { success: false, error: "EMAIL_NOT_VERIFIED", email }
  }

  try {
    await signIn("credentials", { email, password, redirect: false })
    return { success: true }
  } catch {
    return { success: false, error: "Sign in failed" }
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" })
}
