import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { JsonStoreForm } from "@/components/json/json-store-form"
import { cn } from "@/lib/utils"
import { ChevronLeft } from "lucide-react"

export default function NewJsonStorePage() {
  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-center border-b pb-6">
        <Link
          href="/dashboard/json"
          className={cn(buttonVariants({ variant: "ghost" }))}
        >
          <ChevronLeft />
        </Link>
        <h1 className="text-2xl font-bold">Create JSON Store</h1>
      </div>
      <JsonStoreForm />
    </div>
  )
}
