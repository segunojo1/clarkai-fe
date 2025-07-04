"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { SessionProvider } from "next-auth/react"
import NextTopLoader from "nextjs-toploader"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <NextTopLoader color="#F14E07"/>
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  )
}
