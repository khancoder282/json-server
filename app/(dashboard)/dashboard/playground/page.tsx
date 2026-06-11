import Link from "next/link"
import { auth } from "@/auth"
import {
  getAllJsonStoresByUser,
  getJsonStoreById,
} from "@/lib/data/json-stores"
import { getApiKeysWithStoreAccess } from "@/lib/data/api-keys"
import { Playground } from "@/components/json/playground"

interface Props {
  searchParams: Promise<{ store?: string }>
}

export default async function PlaygroundPage({ searchParams }: Props) {
  const { store: storeParam } = await searchParams
  const session = await auth()
  const userId = session!.user!.id!

  const stores = await getAllJsonStoresByUser(userId)

  if (stores.length === 0) {
    return (
      <div className="max-w-6xl space-y-8">
        <div className="border-b pb-6">
          <h1 className="text-2xl font-bold">Playground</h1>
        </div>
        <div className="rounded-lg border py-12 text-center text-muted-foreground">
          You have no JSON stores yet.{" "}
          <Link
            href="/dashboard/json/new"
            className="text-foreground underline"
          >
            Create one
          </Link>{" "}
          to start testing.
        </div>
      </div>
    )
  }

  // Only load a store when one is explicitly chosen (and owned by the user) —
  // the request UI stays disabled until the user picks a store and a key.
  const targetId = stores.some((s) => s.id === storeParam) ? storeParam! : null
  const [store, apiKeys] = targetId
    ? await Promise.all([
        getJsonStoreById(targetId),
        getApiKeysWithStoreAccess(userId, targetId),
      ])
    : [null, []]
  const safeStore = store && store.userId === userId ? store : null

  return (
    <div className="max-w-6xl space-y-8">
      <div className="border-b pb-6">
        <h1 className="text-2xl font-bold">Playground</h1>
        <p className="text-muted-foreground">
          Pick a JSON store and an API key to start sending requests.
        </p>
      </div>
      {/* key forces a clean remount (state reset) when the store changes */}
      <Playground
        key={safeStore?.id ?? "none"}
        store={safeStore}
        apiKeys={apiKeys}
        stores={stores}
      />
    </div>
  )
}
