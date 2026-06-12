"use client"
import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

const COLOR = "oklch(0.852 0.199 91.936)"

export function ProgressBar() {
  const pathname = usePathname()
  const [width, setWidth] = useState(0)
  const [opacity, setOpacity] = useState(0)
  const startTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const crawlTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeRef = useRef(false)

  // Detect navigation start by patching history methods.
  useEffect(() => {
    const origPush = history.pushState.bind(history)
    const origReplace = history.replaceState.bind(history)

    function onNavigationStart() {
      // Cancel any in-progress bar
      if (startTimerRef.current) clearTimeout(startTimerRef.current)
      if (crawlTimerRef.current) clearTimeout(crawlTimerRef.current)

      activeRef.current = false

      // Only show bar after 150 ms — instant cached navigations never reach this
      startTimerRef.current = setTimeout(() => {
        activeRef.current = true
        setWidth(20)
        setOpacity(1)
        crawlTimerRef.current = setTimeout(() => setWidth(60), 400)
        crawlTimerRef.current = setTimeout(() => setWidth(80), 1200)
      }, 150)
    }

    history.pushState = (...args) => {
      onNavigationStart()
      return origPush(...args)
    }
    history.replaceState = (...args) => {
      onNavigationStart()
      return origReplace(...args)
    }

    return () => {
      history.pushState = origPush
      history.replaceState = origReplace
    }
  }, [])

  // Detect navigation complete via pathname change.
  useEffect(() => {
    if (startTimerRef.current) {
      clearTimeout(startTimerRef.current)
      startTimerRef.current = null
    }
    if (crawlTimerRef.current) {
      clearTimeout(crawlTimerRef.current)
      crawlTimerRef.current = null
    }

    if (!activeRef.current) return

    activeRef.current = false
    setWidth(100)
    const hide = setTimeout(() => {
      setOpacity(0)
      setTimeout(() => setWidth(0), 300)
    }, 200)

    return () => clearTimeout(hide)
  }, [pathname])

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: 3,
        width: `${width}%`,
        background: COLOR,
        boxShadow: `0 0 8px ${COLOR}`,
        opacity,
        zIndex: 9999,
        pointerEvents: "none",
        transition: "width 0.3s ease, opacity 0.3s ease",
      }}
    />
  )
}
