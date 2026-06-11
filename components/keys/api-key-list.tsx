"use client"
import { useState, useTransition, useMemo } from "react"
import { useRouter } from "next/navigation"
import { type JsonStore } from "@/lib/db/schema"
import { cn, maskApiKey } from "@/lib/utils"
import {
  deleteApiKeyAction,
  toggleApiKeyLockAction,
  updateApiKeyAction,
} from "@/lib/actions/api-keys"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Pagination } from "@/components/shared/pagination"
import { SortableHeader } from "@/components/shared/sortable-header"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Check,
  Copy,
  Lock,
  LockOpen,
  Loader2,
  MoreVertical,
  Search,
  SquarePen,
  Trash2,
} from "lucide-react"

interface ApiKeyWithCount {
  id: string
  name: string
  key: string
  permissions: string
  isLocked: boolean
  linkedCount: number
  linkedStoreIds: string[]
  createdAt: Date
}

interface Props {
  data: { rows: ApiKeyWithCount[]; total: number; page: number; limit: number }
  stores: JsonStore[]
}

export function ApiKeyList({ data, stores }: Props) {
  const { rows: keys, total, page, limit } = data
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [editKey, setEditKey] = useState<ApiKeyWithCount | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteApiKeyAction(id)
      router.refresh()
    })
  }

  function handleToggleLock(id: string) {
    startTransition(async () => {
      await toggleApiKeyLockAction(id)
      router.refresh()
    })
  }

  function handleCopy(key: string, id: string) {
    navigator.clipboard.writeText(key)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (keys.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No API keys yet. Create one to get started.
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>
                <SortableHeader column="permissions">Permissions</SortableHeader>
              </TableHead>
              <TableHead className="text-center">Linked Stores</TableHead>
              <TableHead>
                <SortableHeader column="createdAt">Created</SortableHeader>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.map((key) => (
              <TableRow key={key.id} className={cn(key.isLocked && "opacity-60")}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {key.isLocked && (
                      <Lock className="size-3 shrink-0 text-muted-foreground" />
                    )}
                    <button
                      onClick={() => handleCopy(key.key, key.id)}
                      className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {copiedId === key.id ? (
                        <Check className="size-3 shrink-0 text-green-500" />
                      ) : (
                        <Copy className="size-3 shrink-0" />
                      )}
                      {maskApiKey(key.key)}
                    </button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {key.permissions.split(",").map((p) => {
                      const isGet = p === "get"
                      return (
                        <Badge
                          key={p}
                          className={cn(
                            "gap-1 border-transparent text-xs uppercase",
                            isGet
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                              : "bg-amber-500/15 text-amber-700 dark:text-amber-500"
                          )}
                        >
                          {isGet ? (
                            <ArrowDownToLine className="size-3" />
                          ) : (
                            <ArrowUpFromLine className="size-3" />
                          )}
                          {p}
                        </Badge>
                      )
                    })}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary">{key.linkedCount}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(key.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="secondary">
                          <MoreVertical />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => setEditKey(key)}>
                          <SquarePen className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleLock(key.id)}
                          disabled={pending}
                        >
                          {key.isLocked ? (
                            <>
                              <LockOpen className="size-4" />
                              Unlock
                            </>
                          ) : (
                            <>
                              <Lock className="size-4" />
                              Lock
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          closeOnClick={false}
                        >
                          <ConfirmDialog
                            loading={pending}
                            trigger={
                              <span className="flex items-center gap-2">
                                <Trash2 className="size-4" />
                                Delete
                              </span>
                            }
                            title="Delete API Key"
                            description="This will permanently delete this API key."
                            onConfirm={() => handleDelete(key.id)}
                          />
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editKey && (
        <EditKeyDialog
          apiKey={editKey}
          stores={stores}
          onClose={() => {
            setEditKey(null)
            router.refresh()
          }}
        />
      )}
      <Pagination page={page} total={total} limit={limit} />
    </>
  )
}

function EditKeyDialog({
  apiKey,
  stores,
  onClose,
}: {
  apiKey: ApiKeyWithCount
  stores: JsonStore[]
  onClose: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(apiKey.linkedStoreIds)
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return stores
    return stores.filter(
      (s) =>
        s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
    )
  }, [stores, search])

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((s) => selectedIds.has(s.id))
  const someFilteredSelected = filtered.some((s) => selectedIds.has(s.id))

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectFiltered() {
    setSelectedIds((prev) => new Set([...prev, ...filtered.map((s) => s.id)]))
  }

  function deselectFiltered() {
    const filteredSet = new Set(filtered.map((s) => s.id))
    setSelectedIds(
      (prev) => new Set([...prev].filter((id) => !filteredSet.has(id)))
    )
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateApiKeyAction(apiKey.id, formData)
      if (result.success) onClose()
      else setError(result.error ?? "Failed to update")
    })
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit API Key</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Inject selected IDs as hidden inputs — safe across filter changes */}
          {[...selectedIds].map((id) => (
            <input key={id} type="hidden" name="storeIds" value={id} />
          ))}

          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  name="perm_get"
                  value="get"
                  defaultChecked={apiKey.permissions.includes("get")}
                  disabled={pending}
                />
                <span className="text-sm">GET</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  name="perm_put"
                  value="put"
                  defaultChecked={apiKey.permissions.includes("put")}
                  disabled={pending}
                />
                <span className="text-sm">PUT</span>
              </label>
            </div>
          </div>

          {stores.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Linked JSON Stores</Label>
                <span className="text-xs text-muted-foreground">
                  {selectedIds.size} / {stores.length} selected
                </span>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or ID…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 text-sm"
                  disabled={pending}
                />
              </div>

              {/* Bulk actions */}
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  disabled={allFilteredSelected || pending}
                  onClick={selectFiltered}
                >
                  {search ? "Select filtered" : "Select all"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  disabled={!someFilteredSelected || pending}
                  onClick={deselectFiltered}
                >
                  {search ? "Deselect filtered" : "Deselect all"}
                </Button>
                {search && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Store list */}
              <div className="max-h-72 overflow-y-auto rounded-md border">
                {filtered.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No stores match.
                  </p>
                ) : (
                  <div className="space-y-px p-1">
                    {filtered.map((s) => {
                      const checked = selectedIds.has(s.id)
                      return (
                        <label
                          key={s.id}
                          className={cn(
                            "flex cursor-pointer items-center gap-2.5 rounded px-2 py-1.5 hover:bg-muted",
                            checked && "bg-muted/60"
                          )}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggle(s.id)}
                            disabled={pending}
                          />
                          <span className="min-w-0 flex-1 truncate text-sm">
                            {s.name}
                          </span>
                          <span className="shrink-0 font-mono text-xs text-muted-foreground">
                            {s.id.slice(0, 8)}…
                          </span>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
