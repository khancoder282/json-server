import { randomBytes } from "crypto"

export function generateApiKey(): string {
  const hex = randomBytes(16).toString("hex")
  return `json-server-${hex}`
}

export function generateToken(): string {
  return randomBytes(32).toString("hex")
}
