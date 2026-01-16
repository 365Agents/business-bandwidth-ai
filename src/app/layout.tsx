import type { Metadata } from "next"
import { Toaster } from "@/components/ui/sonner"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CookieConsent } from "@/components/cookie-consent"
import "./globals.css"

export const metadata: Metadata = {
  title: "NetworkGPT - Worldwide Internet Quotes",
  description: "AI-powered connectivity quotes for any location worldwide. 200 points of presence. 200+ last-mile carriers. One best price for your location.",
  keywords: ["business internet", "internet quotes", "enterprise connectivity", "bandwidth quotes", "carrier quotes"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster />
        <CookieConsent />
      </body>
    </html>
  )
}
