import * as React from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { Input } from "./input"

function PasswordInput({ disabled, ...props }: React.ComponentProps<"input">) {
  const [show, setShow] = React.useState(false)

  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        className="pr-9"
        disabled={disabled}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        disabled={disabled}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {show ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
      </button>
    </div>
  )
}

export { PasswordInput }