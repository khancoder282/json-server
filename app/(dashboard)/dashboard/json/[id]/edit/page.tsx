import Link from "next/link"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { getJsonStoreById } from "@/lib/data/json-stores"
import { JsonStoreForm } from "@/components/json/json-store-form"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditJsonStorePage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  const store = await getJsonStoreById(id)

  if (!store || store.userId !== session!.user!.id) notFound()

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/json" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          ← Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit JSON Store</h1>
          <p className="text-muted-foreground">{store.name}</p>
        </div>
      </div>
      <JsonStoreForm store={store} />
    </div>
  )
}
