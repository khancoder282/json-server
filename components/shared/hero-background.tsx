"use client"
import { motion } from "motion/react"

const tokens = [
  { text: "{", top: "12%", left: "6%",  size: "5xl", delay: 0,   dur: 11 },
  { text: "}", top: "72%", left: "4%",  size: "4xl", delay: 2.0, dur: 14 },
  { text: "[", top: "18%", right: "8%", size: "4xl", delay: 1.2, dur: 13 },
  { text: "]", top: "65%", right: "6%", size: "5xl", delay: 3.0, dur: 11 },
  { text: ":", top: "42%", left: "3%",  size: "3xl", delay: 4.0, dur: 15 },
  { text: ",", top: "55%", right: "4%", size: "3xl", delay: 1.5, dur: 13 },
  { text: '"id"',      top: "30%", left: "2%",   size: "sm", delay: 2.5, dur: 16 },
  { text: '"content"', top: "80%", right: "3%",  size: "sm", delay: 0.8, dur: 14 },
  { text: "true",      top: "8%",  right: "20%", size: "sm", delay: 3.5, dur: 18 },
  { text: "null",      top: "88%", left: "14%",  size: "sm", delay: 5.0, dur: 15 },
]

export function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden">
      {/* grid lines */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* primary radial glow at top-center */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 50% -5%, oklch(0.852 0.199 91.936 / 0.10), transparent)",
        }}
      />

      {/* floating JSON tokens */}
      {tokens.map(({ text, top, left, right, size, delay, dur }, i) => (
        <motion.span
          key={i}
          className={`absolute font-mono font-bold text-foreground/[0.055] text-${size}`}
          style={{ top, left, right } as React.CSSProperties}
          animate={{ y: [-10, 10, -10], x: [-4, 4, -4], rotate: [-4, 4, -4] }}
          transition={{ duration: dur, delay, repeat: Infinity, ease: "easeInOut" }}
        >
          {text}
        </motion.span>
      ))}
    </div>
  )
}
