import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { JsonStoreForm } from "@/components/json/json-store-form"
import { cn } from "@/lib/utils"

export default function NewJsonStorePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/json" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          ← Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create JSON Store</h1>
          <p className="text-muted-foreground">Add a new JSON data store</p>
        </div>
      </div>
      <JsonStoreForm />
    </div>
  )
}
