import Link from "next/link"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { getJsonStoreById } from "@/lib/data/json-stores"
import { JsonStoreForm } from "@/components/json/json-store-form"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronLeft } from "lucide-react"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditJsonStorePage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  const store = await getJsonStoreById(id)

  if (!store || store.userId !== session!.user!.id) notFound()

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-center border-b pb-6">
        <Link
          href="/dashboard/json"
          className={cn(buttonVariants({ variant: "ghost" }))}
        >
          <ChevronLeft />
        </Link>
        <h1 className="text-2xl font-bold">Edit JSON Store</h1>
      </div>
      <JsonStoreForm store={store} />
    </div>
  )
}
