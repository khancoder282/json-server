"use client"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ChevronLeft, ChevronRight, Database, Key, LayoutDashboard, ScrollText } from "lucide-react"
import { cn } from "@/lib/utils"
import { ImageFrame } from "@/components/shared/image-frame"

const slides = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    imageLabel: "Dashboard screenshot",
    tag: "Frame 2",
    urlSlug: "dashboard",
  },
  {
    id: "editor",
    label: "JSON Editor",
    icon: Database,
    imageLabel: "JSON editor screenshot",
    tag: "Frame 3",
    urlSlug: "dashboard/json",
  },
  {
    id: "keys",
    label: "API Keys",
    icon: Key,
    imageLabel: "API keys screenshot",
    tag: "Frame 4",
    urlSlug: "dashboard/keys",
  },
  {
    id: "logs",
    label: "Logs",
    icon: ScrollText,
    imageLabel: "Access logs screenshot",
    tag: "Frame 5",
    urlSlug: "dashboard/logs",
  },
]

const INTERVAL = 4500

export function ScreenshotCarousel() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const [paused, setPaused] = useState(false)

  const goTo = useCallback(
    (i: number, dir?: number) => {
      setDirection(dir ?? (i > current ? 1 : -1))
      setCurrent(i)
    },
    [current],
  )

  const next = useCallback(() => {
    setDirection(1)
    setCurrent((i) => (i + 1) % slides.length)
  }, [])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent((i) => (i - 1 + slides.length) % slides.length)
  }, [])

  useEffect(() => {
    if (paused) return
    const id = setInterval(next, INTERVAL)
    return () => clearInterval(id)
  }, [paused, next])

  const slide = slides[current]

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Tab pills */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {slides.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.button
              key={s.id}
              onClick={() => goTo(i)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
                i === current
                  ? "bg-primary text-primary-foreground shadow-sm scale-105"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )}
            >
              <Icon className="size-3.5 shrink-0" />
              {s.label}
            </motion.button>
          )
        })}
      </div>

      {/* Browser frame */}
      <div className="relative overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-black/10">
        {/* Chrome bar */}
        <div className="relative flex items-center gap-3 border-b bg-muted/50 px-4 py-3">
          <div className="flex shrink-0 gap-1.5">
            <div className="size-3 rounded-full bg-red-400/80" />
            <div className="size-3 rounded-full bg-yellow-400/80" />
            <div className="size-3 rounded-full bg-green-400/80" />
          </div>
          {/* URL bar */}
          <div className="mx-auto max-w-sm flex-1 overflow-hidden rounded-md bg-background/70 px-3 py-1 text-center font-mono text-xs text-muted-foreground">
            <AnimatePresence mode="wait">
              <motion.span
                key={current}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="block"
              >
                app.json-server.com/{slide.urlSlug}
              </motion.span>
            </AnimatePresence>
          </div>
          {/* Auto-play progress bar */}
          {!paused && (
            <div className="absolute bottom-0 left-0 h-[2px] w-full bg-primary/10">
              <motion.div
                key={`${current}-progress`}
                className="h-full bg-primary/60"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: INTERVAL / 1000, ease: "linear" }}
              />
            </div>
          )}
        </div>

        {/* Slide content */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={current}
              custom={direction}
              variants={{
                enter:  (d: number) => ({ x: d > 0 ? "75%" : "-75%", opacity: 0, scale: 0.97 }),
                center: { x: 0, opacity: 1, scale: 1 },
                exit:   (d: number) => ({ x: d < 0 ? "75%" : "-75%", opacity: 0, scale: 0.97 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0"
            >
              {/* ↓ Replace with: <Image src="/img/slide-N.png" fill className="object-cover" alt="..." /> */}
              <ImageFrame label={slide.imageLabel} tag={slide.tag} />
            </motion.div>
          </AnimatePresence>

          {/* Prev / Next arrows */}
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border bg-background/80 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:text-foreground"
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border bg-background/80 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:text-foreground"
            aria-label="Next slide"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="mt-4 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === current
                ? "w-6 bg-primary"
                : "w-1.5 bg-muted-foreground/25 hover:bg-muted-foreground/50",
            )}
          />
        ))}
      </div>
    </div>
  )
}
