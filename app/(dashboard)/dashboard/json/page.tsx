import Link from "next/link"
import { auth } from "@/auth"
import { getJsonStoresByUser } from "@/lib/data/json-stores"
import { buttonVariants } from "@/components/ui/button"
import { JsonStoreList } from "@/components/json/json-store-list"
import { cn } from "@/lib/utils"

export default async function JsonManagementPage() {
  const session = await auth()
  const stores = await getJsonStoresByUser(session!.user!.id!)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">JSON Management</h1>
          <p className="text-muted-foreground">Manage your JSON stores</p>
        </div>
        <Link href="/dashboard/json/new" className={cn(buttonVariants())}>
          Create New
        </Link>
      </div>
      <JsonStoreList stores={stores} />
    </div>
  )
}
