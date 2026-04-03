import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/providers/auth-provider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "B2B 관리 플랫폼",
  description: "거래처, 프로젝트, 문서 관리를 한눈에",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={geistSans.variable}>
      <body className="min-h-screen bg-white font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
