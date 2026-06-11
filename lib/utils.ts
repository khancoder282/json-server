import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Display-only masking: json-server-a1b2...f9e8
export function maskApiKey(key: string): string {
  const prefix = "json-server-"
  const hasPrefix = key.startsWith(prefix)
  const secret = hasPrefix ? key.slice(prefix.length) : key
  const shown = hasPrefix ? prefix : ""
  if (secret.length <= 8) return `${shown}...`
  return `${shown}${secret.slice(0, 4)}...${secret.slice(-4)}`
}
