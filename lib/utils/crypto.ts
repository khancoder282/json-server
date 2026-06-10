import { randomBytes } from "crypto"

export function generateApiKey(): string {
  const hex = randomBytes(16).toString("hex")
  return `json-server-${hex}`
}

export function maskApiKey(key: string): string {
  const prefix = "json-server-"
  const visible = key.slice(prefix.length, prefix.length + 4)
  return `${prefix}${visible}****`
}

export function generateToken(): string {
  return randomBytes(32).toString("hex")
}
