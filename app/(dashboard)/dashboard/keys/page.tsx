import { auth } from "@/auth"
import { getApiKeysByUser } from "@/lib/data/api-keys"
import { getJsonStoresByUser } from "@/lib/data/json-stores"
import { ApiKeyList } from "@/components/keys/api-key-list"
import { CreateKeyDialog } from "@/components/keys/create-key-dialog"

interface Props {
  searchParams: Promise<{ page?: string; sort?: string; order?: string }>
}

export default async function KeyManagementPage({ searchParams }: Props) {
  const session = await auth()
  const userId = session!.user!.id!
  const sp = await searchParams
  const page = sp.page ? parseInt(sp.page) : 1
  const sort = (sp.sort as "createdAt" | "permissions") || "createdAt"
  const order = (sp.order as "asc" | "desc") || "desc"

  const [data, allStores] = await Promise.all([
    getApiKeysByUser(userId, page, sort, order),
    getJsonStoresByUser(userId),
  ])

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold">Key Management</h1>
          <p className="text-muted-foreground">Manage your API keys</p>
        </div>
        <CreateKeyDialog stores={allStores.rows} />
      </div>
      <ApiKeyList data={data} stores={allStores.rows} />
    </div>
  )
}
