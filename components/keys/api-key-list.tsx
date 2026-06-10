"use client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { type JsonStore } from "@/lib/db/schema"
import { deleteApiKeyAction, updateApiKeyAction } from "@/lib/actions/api-keys"
import { maskApiKey } from "@/lib/utils/crypto"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ApiKeyWithCount {
  id: string
  name: string
  key: string
  permissions: string
  linkedCount: number
  createdAt: Date
}

interface Props {
  keys: ApiKeyWithCount[]
  stores: JsonStore[]
}

export function ApiKeyList({ keys, stores }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [editKey, setEditKey] = useState<ApiKeyWithCount | null>(null)

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteApiKeyAction(id)
      router.refresh()
    })
  }

  if (keys.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
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
              <TableHead>Name</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Linked Stores</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.map((key) => (
              <TableRow key={key.id}>
                <TableCell className="font-medium">{key.name}</TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{maskApiKey(key.key)}</code>
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
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(key.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditKey(key)}>
                      Edit
                    </Button>
                    <ConfirmDialog
                      trigger={
                        <Button variant="destructive" size="sm" disabled={pending}>
                          Delete
                        </Button>
                      }
                      title="Delete API Key"
                      description="This will permanently delete this API key."
                      onConfirm={() => handleDelete(key.id)}
                    />
                  </div>
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
          onClose={() => { setEditKey(null); router.refresh() }}
        />
      )}
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
          <div className="grid gap-1.5">
            <Label>Name</Label>
            <Input name="name" defaultValue={apiKey.name} required />
          </div>
          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox name="perm_get" value="get" defaultChecked={apiKey.permissions.includes("get")} />
                <span className="text-sm">GET</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox name="perm_put" value="put" defaultChecked={apiKey.permissions.includes("put")} />
                <span className="text-sm">PUT</span>
              </label>
            </div>
          </div>
          {stores.length > 0 && (
            <div className="space-y-2">
              <Label>Linked JSON Stores</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {stores.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox name="storeIds" value={s.id} />
                    <span className="text-sm">{s.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
