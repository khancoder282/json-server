/**
 * Resolve a dot/bracket path into a parsed JSON value.
 *
 *   selectByPath(content, "user[0].role.name")   – array index
 *   selectByPath(content, "users.Thanh Khan")     – key with space
 *   selectByPath(content, "users[1]")             – Nth value of an object
 *
 * When a numeric index [N] is applied to a plain object (not an array),
 * it returns the Nth value via Object.values() ordering — consistent with
 * how most consumers expect sequential access to work on object-shaped data.
 */
export function selectByPath(
  content: unknown,
  path: string
): { found: boolean; value: unknown } {
  // Split "a.b[2].c" → ["a", "b", "[2]", "c"]
  // Bracket segments keep their brackets so we can detect them below.
  const segments = path
    .split(/(\[\d+\])/)           // split on [N], keeping the delimiter
    .flatMap((s) => s.split(".")) // split remaining on dots
    .filter(Boolean)

  if (segments.length === 0) return { found: true, value: content }

  let current: unknown = content

  for (const seg of segments) {
    if (current === null || current === undefined) {
      return { found: false, value: undefined }
    }

    const arrayMatch = seg.match(/^\[(\d+)\]$/)

    if (arrayMatch) {
      const idx = parseInt(arrayMatch[1], 10)

      if (Array.isArray(current)) {
        if (idx >= current.length) return { found: false, value: undefined }
        current = current[idx]
      } else if (typeof current === "object") {
        // Object: treat [N] as Nth value (Object.values ordering)
        const vals = Object.values(current as Record<string, unknown>)
        if (idx >= vals.length) return { found: false, value: undefined }
        current = vals[idx]
      } else {
        return { found: false, value: undefined }
      }
    } else {
      if (typeof current !== "object" || Array.isArray(current)) {
        return { found: false, value: undefined }
      }
      const obj = current as Record<string, unknown>
      if (!(seg in obj)) return { found: false, value: undefined }
      current = obj[seg]
    }
  }

  return { found: true, value: current }
}
