import Link from "next/link"
import { auth } from "@/auth"
import { getJsonStoresByUser } from "@/lib/data/json-stores"
import { buttonVariants } from "@/components/ui/button"
import { JsonStoreList } from "@/components/json/json-store-list"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"

interface Props {
  searchParams: Promise<{ page?: string; sort?: string; order?: string }>
}

export default async function JsonManagementPage({ searchParams }: Props) {
  const session = await auth()
  const sp = await searchParams
  const page = sp.page ? parseInt(sp.page) : 1
  const sort = (sp.sort as "createdAt" | "isPublic") || "createdAt"
  const order = (sp.order as "asc" | "desc") || "desc"
  const data = await getJsonStoresByUser(session!.user!.id!, page, sort, order)

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">JSON Management</h1>
          <p className="text-muted-foreground">Manage your JSON stores</p>
        </div>
        <Link
          href="/dashboard/json/new"
          className={cn(buttonVariants({ variant: "secondary" }))}
        >
          <Plus className="size-4" />
          Create New
        </Link>
      </div>
      <JsonStoreList data={data} />
    </div>
  )
}
