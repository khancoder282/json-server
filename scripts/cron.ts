import { drizzle } from "drizzle-orm/mysql2"
import mysql from "mysql2/promise"
import { lt } from "drizzle-orm"
import cron from "node-cron"
import * as schema from "../lib/db/schema"

// createPool is synchronous (no top-level await) so the bundled cron.js stays
// a plain module PM2 can require() — and a pool suits a long-running process.
const pool = mysql.createPool(
  process.env.DATABASE_URL ?? "mysql://root:root@localhost:3303/json-server",
)
const db = drizzle(pool, { schema, mode: "default" })

cron.schedule("0 0 * * 0", async () => {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  await db.delete(schema.logs).where(lt(schema.logs.createdAt, cutoff))
  console.log(`[cron] Deleted logs older than ${cutoff.toISOString()}`)
})

console.log("[cron] Weekly log cleanup job registered (runs every Sunday at midnight)")
