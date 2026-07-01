"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useBibleStore } from "@/stores/bibleStore"
import { BookOpen, MessageSquare, Globe, FolderOpen } from "lucide-react"

interface BibleItem {
  id: string
  name: string
  abbr: string
  language: string
}

interface CommentaryItem {
  id: string
  name: string
  author: string
}

interface DictItem {
  id: string
  name: string
  author: string
}

const commentaryItems: CommentaryItem[] = [
  { id: "matthew-henry", name: "Matthew Henry", author: "Matthew Henry" },
  { id: "macarthur", name: "MacArthur", author: "John MacArthur" },
  { id: "wiersbe", name: "Wiersbe", author: "Warren Wiersbe" },
  { id: "beacon", name: "Beacon", author: "Varios" },
  { id: "moody", name: "Moody", author: "Varios" },
]

const dictionaryItems: DictItem[] = [
  { id: "vine", name: "Vine", author: "W.E. Vine" },
  { id: "easton", name: "Easton", author: "M.G. Easton" },
  { id: "isbe", name: "ISBE", author: "Varios" },
  { id: "nelson", name: "Nelson", author: "Varios" },
]

type SectionId = "bibles" | "commentaries" | "dictionaries" | "atlas" | "resources"

export function LeftPanel() {
  const { state, dispatch } = useBibleStore()
  const [activeSection, setActiveSection] = useState<SectionId>("bibles")
  const [bibleItems, setBibleItems] = useState<BibleItem[]>([])

  useEffect(() => {
    fetch("/api/bibles")
      .then((r) => r.json())
      .then(setBibleItems)
      .catch(() => {})
  }, [])

  const sections = [
    { id: "bibles" as SectionId, label: "Biblias", icon: BookOpen },
    { id: "commentaries" as SectionId, label: "Comentarios", icon: MessageSquare },
    { id: "dictionaries" as SectionId, label: "Diccionarios", icon: Globe },
    { id: "atlas" as SectionId, label: "Atlas", icon: Globe },
    { id: "resources" as SectionId, label: "Recursos", icon: FolderOpen },
  ]

  return (
    <div className="flex h-full">
      <div className="w-12 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col items-center py-3 gap-2">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                activeSection === section.id
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
              )}
              title={section.label}
            >
              <Icon size={16} />
            </button>
          )
        })}
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border-color)]">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {sections.find((s) => s.id === activeSection)?.label}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {activeSection === "bibles" && (
            <div className="space-y-1">
              {bibleItems.length === 0 && (
                <p className="text-xs text-[var(--text-tertiary)] px-3 py-4 text-center">
                  Cargando...
                </p>
              )}
              {bibleItems.map((bible) => {
                const isActive = state.activeBibles.some((b) => b.id === bible.id)
                return (
                  <button
                    key={bible.id}
                    onClick={() =>
                      dispatch({
                        type: "TOGGLE_BIBLE",
                        payload: { id: bible.id, name: bible.name, abbr: bible.abbr, language: bible.language, isActive: !isActive },
                      })
                    }
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-[var(--accent-light)] text-[var(--accent)] font-medium"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                    )}
                  >
                    <span className="font-medium">{bible.abbr}</span>
                    <span className="ml-2 text-xs opacity-70">{bible.name}</span>
                  </button>
                )
              })}
            </div>
          )}
          {activeSection === "commentaries" && (
            <div className="space-y-1">
              {commentaryItems.map((item) => {
                const isActive = state.activeCommentaries.some((c) => c.id === item.id)
                return (
                  <button
                    key={item.id}
                    onClick={() =>
                      dispatch({
                        type: "TOGGLE_COMMENTARY",
                        payload: { id: item.id, name: item.name, author: item.author, isActive: !isActive },
                      })
                    }
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-[var(--accent-light)] text-[var(--accent)] font-medium"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                    )}
                  >
                    <span className="font-medium">{item.name}</span>
                    <span className="ml-2 text-xs opacity-70">{item.author}</span>
                  </button>
                )
              })}
            </div>
          )}
          {activeSection === "dictionaries" && (
            <div className="space-y-1">
              {dictionaryItems.map((item) => {
                const isActive = state.activeDictionaries.some((d) => d.id === item.id)
                return (
                  <button
                    key={item.id}
                    onClick={() =>
                      dispatch({
                        type: "TOGGLE_DICTIONARY",
                        payload: { id: item.id, name: item.name, author: item.author, isActive: !isActive },
                      })
                    }
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-[var(--accent-light)] text-[var(--accent)] font-medium"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                    )}
                  >
                    <span className="font-medium">{item.name}</span>
                    <span className="ml-2 text-xs opacity-70">{item.author}</span>
                  </button>
                )
              })}
            </div>
          )}
          {(activeSection === "atlas" || activeSection === "resources") && (
            <p className="text-sm text-[var(--text-tertiary)] px-3 py-8 text-center">Próximamente</p>
          )}
        </div>
      </div>
    </div>
  )
}
