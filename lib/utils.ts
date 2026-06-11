import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Human-readable byte size of a string's UTF-8 content (works on server & client).
export function formatSize(content: string): string {
  const bytes = new TextEncoder().encode(content).length
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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
