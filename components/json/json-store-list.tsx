"use client"
import Link from "next/link"
import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { type JsonStore } from "@/lib/db/schema"
import { deleteJsonStoreAction } from "@/lib/actions/json-stores"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

export function JsonStoreList({ stores }: { stores: JsonStore[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteJsonStoreAction(id)
      router.refresh()
    })
  }

  if (stores.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No JSON stores yet.{" "}
        <Link href="/dashboard/json/new" className="underline">
          Create one
        </Link>
        .
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stores.map((store) => (
            <TableRow key={store.id}>
              <TableCell className="font-medium">{store.name}</TableCell>
              <TableCell>
                <Badge variant={store.isPublic ? "secondary" : "outline"}>
                  {store.isPublic ? "Public" : "Private"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(store.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/dashboard/json/${store.id}/edit`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Edit
                  </Link>
                  <ConfirmDialog
                    trigger={
                      <Button variant="destructive" size="sm" disabled={pending}>
                        Delete
                      </Button>
                    }
                    title="Delete JSON Store"
                    description="This will permanently delete this JSON store and remove it from all API keys."
                    onConfirm={() => handleDelete(store.id)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
