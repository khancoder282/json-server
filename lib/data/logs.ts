"use server"
import { eq, desc, count, and, gte, lte } from "drizzle-orm"
import { db } from "@/lib/db"
import { logs } from "@/lib/db/schema"

export async function getLogsByUser(
  userId: string,
  opts?: {
    page?: number
    limit?: number
    result?: string
    action?: string
    from?: Date
    to?: Date
  },
) {
  const page = opts?.page ?? 1
  const limit = opts?.limit ?? 20
  const offset = (page - 1) * limit

  const where = [eq(logs.userId, userId)]
  if (opts?.result) where.push(eq(logs.result, opts.result))
  if (opts?.action) where.push(eq(logs.action, opts.action))
  if (opts?.from) where.push(gte(logs.createdAt, opts.from))
  if (opts?.to) where.push(lte(logs.createdAt, opts.to))

  const [rows, [total]] = await Promise.all([
    db
      .select()
      .from(logs)
      .where(and(...where))
      .orderBy(desc(logs.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(logs)
      .where(and(...where)),
  ])

  return { rows, total: total.count, page, limit }
}

export async function countLogsByUser(userId: string) {
  const [row] = await db
    .select({ count: count() })
    .from(logs)
    .where(eq(logs.userId, userId))
  return row.count
}

export async function insertLog(data: {
  id: string
  userId?: string | null
  action: string
  result: string
  ip: string
  userAgent: string
  requestBody?: string | null
  responseBody?: string | null
}) {
  await db.insert(logs).values({
    id: data.id,
    userId: data.userId ?? null,
    action: data.action,
    result: data.result,
    ip: data.ip,
    userAgent: data.userAgent,
    requestBody: data.requestBody ?? null,
    responseBody: data.responseBody ?? null,
  })
}
