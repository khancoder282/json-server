/**
 * Resolve a dot/bracket path into a parsed JSON value.
 *
 *   selectByPath(content, "user[0].role.name")
 *   selectByPath(content, "items[2].tags[0]")
 *
 * Bracket indices and dot keys are treated the same (arrays are objects whose
 * keys are numeric strings). Returns `found: false` when any segment is
 * missing — distinct from a segment that legitimately holds `null`.
 */
export function selectByPath(
  content: unknown,
  path: string
): { found: boolean; value: unknown } {
  const keys = path
    .replace(/\[(\w+)\]/g, ".$1") // user[0] → user.0
    .split(".")
    .filter(Boolean)

  if (keys.length === 0) return { found: true, value: content }

  let current: unknown = content
  for (const key of keys) {
    if (current === null || typeof current !== "object") {
      return { found: false, value: undefined }
    }
    if (!(key in (current as Record<string, unknown>))) {
      return { found: false, value: undefined }
    }
    current = (current as Record<string, unknown>)[key]
  }
  return { found: true, value: current }
}
