"use client"
import type { ReactNode } from "react"

const COLORS = [
  "#EFC500", "#FFD43B", // amber — brand primary
  "#FF6B6B", "#FF8B94", // coral / red
  "#4ECDC4", "#45B7D1", // teal / sky
  "#96CEB4",            // sage
  "#DDA0DD", "#C8A2C8", // lilac
  "#FFEAA7",            // pale yellow
]

type Shape = "rect" | "circle" | "star"

interface Particle {
  x: number; y: number
  vx: number; vy: number
  alpha: number; color: string
  size: number; rotation: number; rotSpeed: number
  shape: Shape
}

function drawStar(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const a = (Math.PI * 2 * i) / 5 - Math.PI / 2
    const b = a + Math.PI / 5
    ctx[i === 0 ? "moveTo" : "lineTo"](Math.cos(a) * r, Math.sin(a) * r)
    ctx.lineTo(Math.cos(b) * (r * 0.45), Math.sin(b) * (r * 0.45))
  }
  ctx.closePath()
  ctx.fill()
}

export function CoolMode({ children }: { children: ReactNode }) {
  function fire(e: React.MouseEvent) {
    const cx = e.clientX
    const cy = e.clientY

    const canvas = document.createElement("canvas")
    Object.assign(canvas.style, {
      position: "fixed",
      inset: "0",
      width: "100vw",
      height: "100vh",
      pointerEvents: "none",
      zIndex: "9999",
    })
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    document.body.appendChild(canvas)
    const ctx = canvas.getContext("2d")!

    const shapes: Shape[] = ["rect", "circle", "star"]
    const particles: Particle[] = Array.from({ length: 100 }, () => {
      const angle = Math.random() * Math.PI * 2
      const speed = 5 + Math.random() * 10
      return {
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4, // bias upward
        alpha: 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 5 + Math.random() * 8,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.3,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      }
    })

    let frame: number
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = false

      for (const p of particles) {
        p.vy += 0.22        // gravity
        p.vx *= 0.98        // air resistance
        p.vy *= 0.98
        p.x += p.vx
        p.y += p.vy
        p.alpha -= 0.014
        p.rotation += p.rotSpeed
        if (p.alpha <= 0) continue
        alive = true

        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)

        switch (p.shape) {
          case "circle":
            ctx.beginPath()
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
            ctx.fill()
            break
          case "star":
            drawStar(ctx, p.size / 2)
            break
          default: // rect
            ctx.fillRect(-p.size / 2, -p.size * 0.4, p.size, p.size * 0.8)
        }
        ctx.restore()
      }

      if (alive) frame = requestAnimationFrame(tick)
      else canvas.remove()
    }

    frame = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(frame); canvas.remove() }
  }

  return (
    <span style={{ display: "contents" }} onClick={fire}>
      {children}
    </span>
  )
}
