import Link from "next/link"

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 font-semibold ${className ?? ""}`}>
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background text-xs font-bold">
        JS
      </span>
      <span>JSON Server</span>
    </Link>
  )
}
