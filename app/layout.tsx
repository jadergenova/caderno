import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Providers } from "./providers"
import { RegisterServiceWorker } from "./register-sw"

export const metadata: Metadata = {
  title: "Caderno",
  description: "Caderno digital pessoal — anotações, desenho e planejamento com caneta.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Caderno",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1b1b1f",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
        <RegisterServiceWorker />
      </body>
    </html>
  )
}
