"use client"
import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ChevronsUpDown, Search } from "lucide-react"

export interface StoreItem {
  id: string
  name: string
  isPublic: boolean
}

interface Props {
  stores: StoreItem[]
  value: string
  onChange: (id: string) => void
}

export function StoreCombobox({ stores, value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const selected = stores.find((s) => s.id === value) ?? null

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return stores
    return stores.filter(
      (s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
    )
  }, [stores, query])

  function choose(s: StoreItem) {
    onChange(s.id)
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
        <span className="flex w-full items-center gap-2">
          <span
            className={cn(
              "truncate font-mono flex-1 text-left",
              !selected && "font-sans text-muted-foreground"
            )}
          >
            {selected ? selected.name : "Select a store…"}
          </span>
          {selected && (
            <Badge
              variant={selected.isPublic ? "secondary" : "outline"}
              className="shrink-0"
            >
              {selected.isPublic ? "Public" : "Private"}
            </Badge>
          )}
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </span>
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
                placeholder="Search stores…"
                className="h-9 w-full bg-transparent text-sm outline-none"
              />
            </div>
            <ul className="max-h-60 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <li className="px-2 py-3 text-center text-sm text-muted-foreground">
                  No matching stores.
                </li>
              ) : (
                filtered.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => choose(s)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                        s.id === value && "bg-accent/50"
                      )}
                    >
                      <span className="truncate font-mono">{s.name}</span>
                      <Badge
                        variant={s.isPublic ? "secondary" : "outline"}
                        className="shrink-0 text-[10px]"
                      >
                        {s.isPublic ? "Public" : "Private"}
                      </Badge>
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
