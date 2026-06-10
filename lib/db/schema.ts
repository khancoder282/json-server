import {
  boolean,
  longtext,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core"

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const verificationTokens = mysqlTable("verification_tokens", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const jsonStores = mysqlTable("json_stores", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  content: longtext("content").notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const apiKeys = mysqlTable("api_keys", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  permissions: varchar("permissions", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const apiKeyJsonStores = mysqlTable("api_key_json_stores", {
  apiKeyId: varchar("api_key_id", { length: 36 })
    .notNull()
    .references(() => apiKeys.id, { onDelete: "cascade" }),
  jsonStoreId: varchar("json_store_id", { length: 36 })
    .notNull()
    .references(() => jsonStores.id, { onDelete: "cascade" }),
})

export const logs = mysqlTable("logs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }),
  action: varchar("action", { length: 255 }).notNull(),
  result: varchar("result", { length: 50 }).notNull(),
  ip: varchar("ip", { length: 100 }).notNull(),
  userAgent: text("user_agent").notNull(),
  requestBody: longtext("request_body"),
  responseBody: longtext("response_body"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type JsonStore = typeof jsonStores.$inferSelect
export type ApiKey = typeof apiKeys.$inferSelect
export type Log = typeof logs.$inferSelect
