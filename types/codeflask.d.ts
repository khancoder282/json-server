declare module "codeflask" {
  interface CodeFlaskOptions {
    language?: string
    lineNumbers?: boolean
    defaultTheme?: boolean
    readonly?: boolean
    tabSize?: number
    ariaLabelledby?: string
  }

  export default class CodeFlask {
    constructor(
      selectorOrElement: string | HTMLElement,
      options?: CodeFlaskOptions
    )
    updateCode(code: string): void
    getCode(): string
    onUpdate(callback: (code: string) => void): void
    enableReadonlyMode(): void
    disableReadonlyMode(): void
    updateLanguage(name: string): void
  }
}
