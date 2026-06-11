"use client"

import { Editor } from "@monaco-editor/react"
import type { Monaco } from "@monaco-editor/react"
import type * as MonacoType from "monaco-editor"
import { Skeleton } from "@/components/ui/skeleton"
import draculaTheme from "@/lib/editor-themes/dracula.json"
import { cn } from "@/lib/utils"

interface Props {
  value: string
  onChange?: (value: string) => void
  onSyntaxError?: (error: string) => void
  monacoTheme?: "dracula" | "vs"
  readOnly?: boolean
  height?: string
  paddingTop?: number
  paddingBottom?: number
  className?: string
}

function LoadingSkeleton() {
  return (
    <div className="flex h-full flex-col gap-2 p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4 rounded"
          style={{ width: `${[60, 80, 72, 55, 90, 65, 78, 50][i]}%` }}
        />
      ))}
    </div>
  )
}

function beforeMount(monaco: Monaco) {
  monaco.editor.defineTheme(
    "dracula",
    draculaTheme as MonacoType.editor.IStandaloneThemeData
  )
}

function onMount(
  _editor: MonacoType.editor.IStandaloneCodeEditor,
  monaco: Monaco,
  onSyntaxError?: (error: string) => void
) {
  if (!onSyntaxError) return
  monaco.editor.onDidChangeMarkers((resources: MonacoType.Uri[]) => {
    const resource = resources[0]
    if (!resource) return
    const markers = monaco.editor.getModelMarkers({ resource })
    const errors = markers.filter(
      (m: MonacoType.editor.IMarker) =>
        m.severity === monaco.MarkerSeverity.Error
    )
    onSyntaxError(errors.length > 0 ? errors[0].message : "")
  })
}

export function MonacoJsonEditor({
  value,
  onChange,
  onSyntaxError,
  monacoTheme = "vs",
  readOnly = false,
  height,
  paddingTop = 8,
  paddingBottom = 8,
  className,
}: Props) {
  return (
    <div
      className={cn("overflow-hidden rounded-lg border", className, {
        "h-full": !height,
      })}
      style={height ? { height } : undefined}
    >
      <Editor
        height="100%"
        language="json"
        value={value}
        theme={monacoTheme}
        loading={<LoadingSkeleton />}
        beforeMount={beforeMount}
        onMount={(editor, monaco) => onMount(editor, monaco, onSyntaxError)}
        onChange={onChange ? (v) => onChange(v ?? "") : undefined}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          folding: true,
          tabSize: 2,
          scrollBeyondLastLine: false,
          formatOnPaste: true,
          automaticLayout: true,
          wordWrap: "on",
          readOnly,
          padding: { top: paddingTop, bottom: paddingBottom },
        }}
      />
    </div>
  )
}
