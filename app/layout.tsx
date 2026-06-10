import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"
import { SessionProvider } from "next-auth/react"
import NextTopLoader from "nextjs-toploader"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeScript } from "@/components/theme-script"
import { Toaster } from "@/components/shared/toaster"
import { cn } from "@/lib/utils"
import { auth } from "@/auth"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "JSON Server",
  description: "Your personal JSON storage API",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, inter.variable, "font-sans")}
    >
      <head>
        <ThemeScript />
      </head>
      <body>
        <NextTopLoader
          color="oklch(0.852 0.199 91.936)"
          height={3}
          showSpinner={false}
          easing="ease"
          speed={300}
        />
        <SessionProvider session={session}>
          <ThemeProvider>
              {children}
              <Toaster />
            </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
