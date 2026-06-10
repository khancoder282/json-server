"use client"
import { useRef } from "react"
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "motion/react"
import { cn } from "@/lib/utils"

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  strength?: number
}

export function TiltCard({ children, className, strength = 10 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const xMouse = useMotionValue(0)
  const yMouse = useMotionValue(0)
  const x = useSpring(xMouse, { stiffness: 350, damping: 28 })
  const y = useSpring(yMouse, { stiffness: 350, damping: 28 })

  const rotateX = useTransform(y, [-0.5, 0.5], [`${strength}deg`, `-${strength}deg`])
  const rotateY = useTransform(x, [-0.5, 0.5], [`-${strength}deg`, `${strength}deg`])

  // glare spotlight follows cursor
  const glareX = useTransform(x, [-0.5, 0.5], ["0%", "100%"])
  const glareY = useTransform(y, [-0.5, 0.5], ["0%", "100%"])
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.07) 0%, transparent 55%)`

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    xMouse.set((e.clientX - left) / width - 0.5)
    yMouse.set((e.clientY - top) / height - 0.5)
  }

  function onMouseLeave() {
    xMouse.set(0)
    yMouse.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={cn("relative", className)}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {children}
      {/* glare overlay — sits above children, clipped by parent's overflow */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-20 rounded-[inherit]"
        style={{ background: glare }}
      />
    </motion.div>
  )
}
