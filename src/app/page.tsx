"use client"

import { useState } from "react"
import { useBibleStore } from "@/stores/bibleStore"
import { useTheme } from "@/lib/theme"
import { LeftPanel } from "@/components/panels/LeftPanel"
import { CenterPanel } from "@/components/panels/CenterPanel"
import { RightPanel } from "@/components/panels/RightPanel"
import { BottomPanel } from "@/components/panels/BottomPanel"
import { Menu, Sun, Moon, MessageSquare } from "lucide-react"

export default function Home() {
  const { state, dispatch } = useBibleStore()
  const { theme, toggleTheme } = useTheme()
  const [showAi, setShowAi] = useState(false)

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch({ type: "TOGGLE_SIDEBAR" })}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            title="Panel biblioteca"
          >
            <Menu size={18} />
          </button>
          <h1 className="text-sm font-bold tracking-tight">
            Bible <span className="text-[var(--accent)]">AI</span> Studio
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAi(!showAi)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showAi
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
            }`}
            title="Panel IA"
          >
            <MessageSquare size={14} />
            <span className="hidden sm:inline">IA</span>
          </button>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {state.sidebarOpen && (
          <aside className="w-64 border-r border-[var(--border-color)] shrink-0 overflow-hidden">
            <LeftPanel />
          </aside>
        )}

        <main className={`flex-1 flex overflow-hidden transition-all duration-200`}>
          <section className="flex-1 min-w-0 border-r border-[var(--border-color)]">
            <CenterPanel />
          </section>

          {showAi && (
            <aside className="w-80 shrink-0 overflow-hidden border-l border-[var(--border-color)]">
              <RightPanel />
            </aside>
          )}
        </main>
      </div>

      <BottomPanel />
    </div>
  )
}
