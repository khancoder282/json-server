"use client"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"

interface Props {
  column: string
  children: React.ReactNode
  className?: string
}

export function SortableHeader({ column, children, className }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  const currentSort = sp.get("sort")
  const currentOrder = sp.get("order") || "desc"
  const isActive = currentSort === column
  const nextOrder = isActive && currentOrder === "asc" ? "desc" : "asc"

  function handleClick() {
    const params = new URLSearchParams(sp.toString())
    params.set("sort", column)
    params.set("order", nextOrder)
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1 font-medium hover:text-foreground transition-colors ${className ?? ""}`}
    >
      {children}
      {isActive ? (
        currentOrder === "asc" ? (
          <ChevronUp className="size-3" />
        ) : (
          <ChevronDown className="size-3" />
        )
      ) : (
        <ChevronsUpDown className="size-3 opacity-40" />
      )}
    </button>
  )
}
