"use client"

import { ThemeProvider } from "@/lib/theme"
import { BibleProvider } from "@/stores/bibleStore"
import type { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <BibleProvider>{children}</BibleProvider>
    </ThemeProvider>
  )
}
