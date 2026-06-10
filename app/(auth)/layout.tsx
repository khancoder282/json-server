import { Logo } from "@/components/shared/logo"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Logo className="mb-8" />
      {children}
    </div>
  )
}
