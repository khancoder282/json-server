"use client"
import { useEffect, useRef } from "react"
import CodeFlask from "codeflask"
import { cn } from "@/lib/utils"

interface Props {
  value: string
  onChange?: (code: string) => void
  readOnly?: boolean
  height?: string
  className?: string
}

/**
 * CodeFlask-based JSON editor. Theming is driven by CSS (`.codeflask` rules in
 * globals.css) so it follows the app's light/dark mode automatically —
 * `defaultTheme: false` disables CodeFlask's built-in colours. We highlight as
 * "js" since JSON is a subset of JS literals (CodeFlask's Prism bundles js).
 */
export function CodeEditor({
  value,
  onChange,
  readOnly = false,
  height = "240px",
  className,
}: Props) {
  const elRef = useRef<HTMLDivElement>(null)
  const flaskRef = useRef<CodeFlask | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // Init once.
  useEffect(() => {
    const el = elRef.current
    if (!el) return
    const flask = new CodeFlask(el, {
      language: "js",
      lineNumbers: true,
      defaultTheme: false,
      readonly: readOnly,
      tabSize: 2,
    })
    flask.updateCode(value)
    flask.onUpdate((code) => onChangeRef.current?.(code))
    flaskRef.current = flask
    return () => {
      flaskRef.current = null
      el.innerHTML = ""
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync external value changes (guard avoids cursor jumps while typing).
  useEffect(() => {
    const flask = flaskRef.current
    if (flask && flask.getCode() !== value) flask.updateCode(value)
  }, [value])

  // Toggle read-only mode when the prop changes.
  useEffect(() => {
    const flask = flaskRef.current
    if (!flask) return
    if (readOnly) flask.enableReadonlyMode()
    else flask.disableReadonlyMode()
  }, [readOnly])

  return (
    <div
      ref={elRef}
      style={{ height }}
      className={cn(
        "code-flask relative overflow-hidden rounded-lg border",
        className
      )}
    />
  )
}
