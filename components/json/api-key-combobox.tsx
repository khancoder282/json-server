"use client"
import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown, Search } from "lucide-react"

export interface KeyItem {
  id: string
  name: string
  key: string
  permissions: string
  linkedToStore: boolean
}

// Synthetic "no key" entry for public stores (key = "").
const NONE_ID = "__none__"

interface Props {
  keys: KeyItem[]
  value: string
  onChange: (key: string) => void
  allowNone?: boolean
}

export function ApiKeyCombobox({ keys, value, onChange, allowNone }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const items = useMemo<KeyItem[]>(() => {
    const none: KeyItem[] = allowNone
      ? [
          {
            id: NONE_ID,
            name: "No key (public)",
            key: "",
            permissions: "",
            linkedToStore: true,
          },
        ]
      : []
    return [...none, ...keys]
  }, [keys, allowNone])

  const selected = items.find((i) => i.key === value) ?? null

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.permissions.toLowerCase().includes(q)
    )
  }, [items, query])

  function choose(item: KeyItem) {
    onChange(item.key)
    setOpen(false)
    setQuery("")
  }

  return (
    <div className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected && selected.id !== NONE_ID && selected.linkedToStore && (
            <Check className="size-4 shrink-0 text-green-600 dark:text-green-500" />
          )}
          <span
            className={cn("truncate", !selected && "text-muted-foreground")}
          >
            {selected ? selected.name : "Select a key…"}
          </span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <>
          {/* click-outside backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
            <div className="flex items-center gap-2 border-b px-2.5">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search keys…"
                className="h-9 w-full bg-transparent text-sm outline-none"
              />
            </div>
            <ul className="max-h-60 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <li className="px-2 py-3 text-center text-sm text-muted-foreground">
                  No matching keys.
                </li>
              ) : (
                filtered.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => choose(item)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                        item.key === value && "bg-accent/50"
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        {item.id !== NONE_ID &&
                          (item.linkedToStore ? (
                            <Check className="size-4 shrink-0 text-green-600 dark:text-green-500" />
                          ) : (
                            <span className="size-4 shrink-0" />
                          ))}
                        <span className="truncate">{item.name}</span>
                      </span>
                      {item.permissions && (
                        <span className="flex shrink-0 gap-1">
                          {item.permissions.split(",").map((p) => (
                            <Badge
                              key={p}
                              variant="secondary"
                              className="text-[10px] uppercase"
                            >
                              {p}
                            </Badge>
                          ))}
                        </span>
                      )}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
