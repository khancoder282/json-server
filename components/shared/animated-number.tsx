"use client"
import { useEffect, useRef } from "react"
import { useInView, animate } from "motion/react"

export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    const controls = animate(0, value, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (latest) => {
        if (ref.current) {
          ref.current.textContent = Math.round(latest).toLocaleString()
        }
      },
    })
    return () => controls.stop()
  }, [isInView, value])

  return <span ref={ref} className={className}>0</span>
}
