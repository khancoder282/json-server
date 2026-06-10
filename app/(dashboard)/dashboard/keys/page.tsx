import Link from "next/link"
import { auth } from "@/auth"
import { getApiKeysByUser } from "@/lib/data/api-keys"
import { getJsonStoresByUser } from "@/lib/data/json-stores"
import { Button } from "@/components/ui/button"
import { ApiKeyList } from "@/components/keys/api-key-list"
import { CreateKeyDialog } from "@/components/keys/create-key-dialog"

export default async function KeyManagementPage() {
  const session = await auth()
  const userId = session!.user!.id!
  const [keys, stores] = await Promise.all([
    getApiKeysByUser(userId),
    getJsonStoresByUser(userId),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Key Management</h1>
          <p className="text-muted-foreground">Manage your API keys</p>
        </div>
        <CreateKeyDialog stores={stores} />
      </div>
      <ApiKeyList keys={keys} stores={stores} />
    </div>
  )
}
