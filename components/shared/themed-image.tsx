import Image from "next/image"
import { cn } from "@/lib/utils"

interface ThemedImageProps {
  lightSrc: string
  darkSrc: string
  alt: string
  fill?: boolean
  priority?: boolean
  className?: string
  sizes?: string
}

/**
 * Renders two stacked images — one for light mode, one for dark mode.
 * CSS opacity handles the switch so no JS is needed (avoids flash on hydration).
 * Parent must be position:relative with a defined size.
 */
export function ThemedImage({
  lightSrc,
  darkSrc,
  alt,
  className,
  priority,
  ...rest
}: ThemedImageProps) {
  return (
    <>
      <Image
        src={lightSrc}
        alt={alt}
        priority={priority}
        className={cn(className, "transition-opacity duration-300 dark:opacity-0")}
        {...rest}
      />
      <Image
        src={darkSrc}
        alt={alt}
        className={cn(className, "transition-opacity duration-300 opacity-0 dark:opacity-100")}
        {...rest}
      />
    </>
  )
}
