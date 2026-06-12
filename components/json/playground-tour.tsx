"use client"

import { useState, useEffect, useCallback } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, HelpCircle, X } from "lucide-react"

interface Step {
  target: string
  title: string
  body: string
  examples?: string[]
}

const STEPS: Step[] = [
  {
    target: "store-selector",
    title: "1 / 4 — Pick a JSON Store",
    body: "Start by selecting the store you want to test. Each store is a named JSON blob you can read and update through the API.",
  },
  {
    target: "api-key-selector",
    title: "2 / 4 — Choose an API Key",
    body: "API keys control access. A GET key lets you read the store; a PUT key lets you update it. Public stores allow anonymous GET without any key.",
  },
  {
    target: "request-builder",
    title: "3 / 4 — Send a Request",
    body: "GET fetches data — add a path to return just one nested field. PUT deep-merges a JSON body into the store: objects merge recursively, arrays are replaced.",
    examples: ["user.name", "items[0].title", "config.db.host"],
  },
  {
    target: "output-panel",
    title: "4 / 4 — View the Output",
    body: "Response shows the last API result with its HTTP status code. Current JSON lets you view and edit the store content directly, without going through the merge API.",
  },
]

const PAD = 10
const TOOLTIP_W = 348
const TOOLTIP_H = 200

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

function measureTarget(target: string): Rect | null {
  const el = document.querySelector(`[data-tour="${target}"]`)
  if (!el) return null
  const { top, left, width, height } = el.getBoundingClientRect()
  return { top, left, width, height }
}

function computeTooltipStyle(rect: Rect): React.CSSProperties {
  const GAP = 12
  const vpW = window.innerWidth
  const vpH = window.innerHeight
  const centerX = rect.left + rect.width / 2

  const below = rect.top + rect.height + PAD + GAP
  const above = rect.top - PAD - TOOLTIP_H - GAP

  const top = below + TOOLTIP_H < vpH ? below : Math.max(GAP, above)
  const left = Math.max(GAP, Math.min(centerX - TOOLTIP_W / 2, vpW - TOOLTIP_W - GAP))

  return { position: "fixed", top, left, width: TOOLTIP_W, zIndex: 10001 }
}

function centerStyle(): React.CSSProperties {
  return {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: TOOLTIP_W,
    zIndex: 10001,
  }
}

const OVERLAY_BG = "rgba(0,0,0,0.55)"
const BLUR = "blur(5px)"

function SpotlightOverlay({ rect }: { rect: Rect }) {
  const hTop = rect.top - PAD
  const hLeft = rect.left - PAD
  const hRight = rect.left + rect.width + PAD
  const hBottom = rect.top + rect.height + PAD
  const hW = hRight - hLeft
  const hH = hBottom - hTop

  const panelBase: React.CSSProperties = {
    position: "fixed",
    backdropFilter: BLUR,
    background: OVERLAY_BG,
    pointerEvents: "none",
    zIndex: 9999,
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}
    >
      {/* Top strip */}
      <div style={{ ...panelBase, top: 0, left: 0, right: 0, height: hTop }} />
      {/* Left strip */}
      <div style={{ ...panelBase, top: hTop, left: 0, width: hLeft, height: hH }} />
      {/* Right strip */}
      <div style={{ ...panelBase, top: hTop, left: hRight, right: 0, height: hH }} />
      {/* Bottom strip */}
      <div style={{ ...panelBase, top: hBottom, left: 0, right: 0, bottom: 0 }} />
      {/* Spotlight ring — uses animate so it spring-moves between steps without remounting */}
      <motion.div
        animate={{ top: hTop, left: hLeft, width: hW, height: hH }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        style={{
          position: "fixed",
          borderRadius: 10,
          border: "2px solid hsl(var(--primary))",
          boxShadow: "0 0 0 1px hsl(var(--primary) / 0.25), 0 0 20px 0 hsl(var(--primary) / 0.2)",
          pointerEvents: "none",
          zIndex: 10000,
        }}
      />
    </motion.div>
  )
}

export function PlaygroundTourTrigger() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)

  const current = STEPS[step]

  const refresh = useCallback(() => {
    setRect(measureTarget(current.target))
  }, [current.target])

  useEffect(() => {
    if (!open) {
      setStep(0)
      setRect(null)
      return
    }
    const id = requestAnimationFrame(refresh)
    window.addEventListener("resize", refresh)
    window.addEventListener("scroll", refresh, { passive: true })
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener("resize", refresh)
      window.removeEventListener("scroll", refresh)
    }
  }, [open, refresh])

  function prev() {
    setStep((s) => Math.max(0, s - 1))
  }

  function next() {
    if (step < STEPS.length - 1) setStep((s) => s + 1)
    else setOpen(false)
  }

  const tooltipStyle = rect ? computeTooltipStyle(rect) : centerStyle()

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="size-8 rounded-full shrink-0"
        onClick={() => setOpen(true)}
        aria-label="Open tour"
        title="How to use"
      >
        <HelpCircle className="size-4" />
      </Button>

      <AnimatePresence>
        {open && (
          <>
            {rect ? (
              <SpotlightOverlay rect={rect} />
            ) : (
              <motion.div
                key="dimmer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "fixed",
                  inset: 0,
                  backdropFilter: "blur(4px)",
                  background: "rgba(0,0,0,0.55)",
                  pointerEvents: "none",
                  zIndex: 9999,
                }}
              />
            )}

            {/* Click outside to close */}
            <div
              style={{ position: "fixed", inset: 0, zIndex: 10000 }}
              onClick={() => setOpen(false)}
            />

            {/* Tooltip card */}
            <motion.div
              key={`tip-${step}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
              style={tooltipStyle}
              className="rounded-xl border bg-background p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <p className="text-sm font-semibold leading-tight">{current.title}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 shrink-0 -mt-0.5 -mr-0.5"
                  onClick={() => setOpen(false)}
                >
                  <X className="size-3.5" />
                </Button>
              </div>

              <p className="mb-3 text-sm text-muted-foreground leading-relaxed">
                {current.body}
              </p>

              {current.examples && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {current.examples.map((ex) => (
                    <code
                      key={ex}
                      className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground"
                    >
                      ?path={ex}
                    </code>
                  ))}
                </div>
              )}

              {!rect && (
                <p className="mb-3 rounded-md bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                  This element appears after completing the previous steps.
                </p>
              )}

              <div className="flex items-center justify-between">
                {/* Step dots */}
                <div className="flex gap-1.5">
                  {STEPS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setStep(i)}
                      className={`size-1.5 rounded-full transition-colors ${
                        i === step ? "bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  {step > 0 && (
                    <Button variant="outline" size="sm" onClick={prev}>
                      <ChevronLeft className="size-3.5" />
                      Back
                    </Button>
                  )}
                  <Button size="sm" onClick={next}>
                    {step < STEPS.length - 1 ? (
                      <>
                        Next
                        <ChevronRight className="size-3.5" />
                      </>
                    ) : (
                      "Done"
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
