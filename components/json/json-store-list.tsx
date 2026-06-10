"use client"
import Link from "next/link"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { type JsonStore } from "@/lib/db/schema"
import { deleteJsonStoreAction } from "@/lib/actions/json-stores"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Check, Copy, MoreVertical } from "lucide-react"
import dayjs from "dayjs"

interface Props {
  data: { rows: JsonStore[]; total: number; page: number; limit: number }
}

export function JsonStoreList({ data }: Props) {
  const { rows: stores, total, page, limit } = data
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteJsonStoreAction(id)
      router.refresh()
    })
  }

  function handleCopy(id: string) {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (stores.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No JSON stores yet.{" "}
        <Link href="/dashboard/json/new" className="underline">
          Create one
        </Link>
        .
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>
                <SortableHeader column="isPublic">Visibility</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader column="createdAt">Created</SortableHeader>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.map((store) => (
              <TableRow key={store.id}>
                <TableCell>
                  <button
                    onClick={() => handleCopy(store.id)}
                    className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {copiedId === store.id ? (
                      <Check className="size-3 shrink-0 text-green-500" />
                    ) : (
                      <Copy className="size-3 shrink-0" />
                    )}
                    {store.id}
                  </button>
                </TableCell>
                <TableCell>
                  <Badge variant={store.isPublic ? "secondary" : "outline"}>
                    {store.isPublic ? "Public" : "Private"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {dayjs(store.createdAt).format("DD MMM YYYY")}
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
                        <DropdownMenuItem
                          nativeButton={false}
                          render={
                            <Link href={`/dashboard/json/${store.id}/edit`}>
                              Edit
                            </Link>
                          }
                        />
                        <DropdownMenuItem
                          variant="destructive"
                          closeOnClick={false}
                        >
                          <ConfirmDialog
                            loading={pending}
                            trigger={<>Delete</>}
                            title="Delete JSON Store"
                            description="This will permanently delete this JSON store and remove it from all API keys."
                            onConfirm={() => handleDelete(store.id)}
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
      <Pagination page={page} total={total} limit={limit} />
    </>
  )
}
