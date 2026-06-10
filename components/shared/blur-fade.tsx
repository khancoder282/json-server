"use client"
import { motion } from "motion/react"

type Direction = "up" | "down" | "left" | "right" | "none"

interface BlurFadeProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  yOffset?: number
  blur?: string
  triggerOnView?: boolean
  direction?: Direction
}

function getInitial(direction: Direction, yOffset: number, blur: string) {
  const f = `blur(${blur})`
  switch (direction) {
    case "left":  return { opacity: 0, x: -40, y: 0,       filter: f }
    case "right": return { opacity: 0, x:  40, y: 0,       filter: f }
    case "down":  return { opacity: 0, x: 0,   y: -yOffset, filter: f }
    case "none":  return { opacity: 0, x: 0,   y: 0,       filter: f }
    default:      return { opacity: 0, x: 0,   y: yOffset,  filter: f }
  }
}

export function BlurFade({
  children,
  className,
  delay = 0,
  duration = 0.55,
  yOffset = 10,
  blur = "6px",
  triggerOnView = false,
  direction = "up",
}: BlurFadeProps) {
  const initial = getInitial(direction, yOffset, blur)
  const target = { opacity: 1, x: 0, y: 0, filter: "blur(0px)" }
  const transition = { duration, delay, ease: [0.16, 1, 0.3, 1] as const }

  if (triggerOnView) {
    return (
      <motion.div
        className={className}
        initial={initial}
        whileInView={target}
        viewport={{ once: true, margin: "-60px" }}
        transition={transition}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      className={className}
      initial={initial}
      animate={target}
      transition={transition}
    >
      {children}
    </motion.div>
  )
}
