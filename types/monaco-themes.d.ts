declare module "monaco-themes/themes/*.json" {
  import type * as Monaco from "monaco-editor"
  const theme: Monaco.editor.IStandaloneThemeData
  export = theme
}
