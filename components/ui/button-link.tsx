import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "./button"
import type { VariantProps } from "class-variance-authority"

interface ButtonLinkProps
  extends VariantProps<typeof buttonVariants>,
    React.ComponentProps<typeof Link> {}

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return (
    <Link
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
