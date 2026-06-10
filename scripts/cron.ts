import { drizzle } from "drizzle-orm/mysql2"
import mysql from "mysql2/promise"
import { lt } from "drizzle-orm"
import cron from "node-cron"
import * as schema from "../lib/db/schema"

const connection = await mysql.createConnection(
  process.env.DATABASE_URL ?? "mysql://root:root@localhost:3303/json-server",
)
const db = drizzle(connection, { schema, mode: "default" })

cron.schedule("0 0 * * 0", async () => {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  await db.delete(schema.logs).where(lt(schema.logs.createdAt, cutoff))
  console.log(`[cron] Deleted logs older than ${cutoff.toISOString()}`)
})

console.log("[cron] Weekly log cleanup job registered (runs every Sunday at midnight)")
