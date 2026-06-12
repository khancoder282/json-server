import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"
import { SessionProvider } from "next-auth/react"
import { ProgressBar } from "@/components/shared/progress-bar"
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
  metadataBase: new URL("https://json-server.denmobi.vn"),
  title: {
    default: "JSON Server",
    template: "%s | JSON Server",
  },
  description:
    "Store, manage, and serve JSON data with a simple REST API. Create stores, issue API keys, and track every request — all in one place.",
  keywords: [
    "JSON", "REST API", "JSON storage", "API keys",
    "JSON management", "web API", "data API",
  ],
  authors: [{ name: "JSON Server" }],
  creator: "JSON Server",
  openGraph: {
    type: "website",
    url: "https://json-server.denmobi.vn",
    title: "JSON Server — Your personal JSON storage API",
    description:
      "Store, manage, and serve JSON data with a simple REST API. Create stores, issue API keys, and track every request — all in one place.",
    siteName: "JSON Server",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "JSON Server" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Server — Your personal JSON storage API",
    description:
      "Store, manage, and serve JSON data with a simple REST API.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
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
        <ProgressBar />
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
