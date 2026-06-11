"use client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { type JsonStore } from "@/lib/db/schema"
import { maskApiKey } from "@/lib/utils"
import { deleteApiKeyAction, updateApiKeyAction } from "@/lib/actions/api-keys"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Check, Copy, Loader2, MoreVertical } from "lucide-react"

interface ApiKeyWithCount {
  id: string
  name: string
  key: string
  permissions: string
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
              <TableHead><SortableHeader column="permissions">Permissions</SortableHeader></TableHead>
              <TableHead>Linked Stores</TableHead>
              <TableHead><SortableHeader column="createdAt">Created</SortableHeader></TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.map((key) => (
              <TableRow key={key.id}>
                <TableCell>
                  <button
                    onClick={() => handleCopy(key.key, key.id)}
                    className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copiedId === key.id ? (
                      <Check className="size-3 text-green-500 shrink-0" />
                    ) : (
                      <Copy className="size-3 shrink-0" />
                    )}
                    {maskApiKey(key.key)}
                  </button>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {key.permissions.split(",").map((p) => (
                      <Badge key={p} variant="secondary" className="text-xs uppercase">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{key.linkedCount}</TableCell>
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
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" closeOnClick={false}>
                          <ConfirmDialog
                            loading={pending}
                            trigger={<>Delete</>}
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit API Key</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label>Linked JSON Stores</Label>
              <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-2">
                {stores.map((s) => (
                  <label key={s.id} className="flex cursor-pointer items-center gap-2">
                    <Checkbox
                      name="storeIds"
                      value={s.id}
                      defaultChecked={apiKey.linkedStoreIds.includes(s.id)}
                      disabled={pending}
                    />
                    <span className="font-mono text-xs">{s.id}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {pending ? "Saving…" : "Save"}
            </Button>
            <Button type="button" variant="outline" disabled={pending} onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
