"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { useBibleStore } from "@/stores/bibleStore"
import { Tabs } from "@/components/ui/Tabs"
import { Search, Bookmark, Highlighter, ChevronLeft, ChevronRight, BookOpen, MessageSquare } from "lucide-react"

interface Verse {
  id: string
  number: number
  text: string
}

interface Book {
  id: string
  number: number
  name: string
  abbreviation: string
}

export function CenterPanel() {
  const { state, dispatch } = useBibleStore()
  const [activeTab, setActiveTab] = useState("bible")
  const [searchQuery, setSearchQuery] = useState("")
  const [books, setBooks] = useState<Book[]>([])
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [selectedChapter, setSelectedChapter] = useState(1)
  const [totalChapters, setTotalChapters] = useState(1)
  const [verses, setVerses] = useState<Verse[]>([])
  const [selectedVerse, setSelectedVerse] = useState<string | null>(null)
  const [showChapterPicker, setShowChapterPicker] = useState(false)
  const [searchResults, setSearchResults] = useState<{ reference: string; text: string }[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const bibleId = state.activeBibles[0]?.id

  useEffect(() => {
    if (bibleId) {
      fetch(`/api/bibles/${bibleId}/books`)
        .then((r) => r.json())
        .then(setBooks)
    }
  }, [bibleId])

  const loadVerses = async (bookId: string, chapter: number) => {
    const res = await fetch(`/api/books/${bookId}/chapters`)
    const chapters: { id: string; number: number }[] = await res.json()
    setTotalChapters(chapters.length)
    const ch = chapters.find((c) => c.number === chapter)
    if (ch) {
      const vRes = await fetch(`/api/chapters/${ch.id}/verses`)
      setVerses(await vRes.json())
    }
  }

  const handleBookSelect = async (book: Book) => {
    setSelectedBook(book)
    setSelectedChapter(1)
    setShowChapterPicker(false)
    await loadVerses(book.id, 1)
  }

  const handleChapterSelect = async (chapter: number) => {
    setSelectedChapter(chapter)
    setShowChapterPicker(false)
    if (selectedBook) await loadVerses(selectedBook.id, chapter)
  }

  const goChapter = async (dir: number) => {
    const next = selectedChapter + dir
    if (next >= 1 && next <= totalChapters) {
      await handleChapterSelect(next)
    }
  }

  const doSearch = async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return }
    setIsSearching(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=15`)
      const data = await res.json()
      setSearchResults(data.verses || [])
    } catch { setSearchResults([]) }
    setIsSearching(false)
  }

  const handleSearchInput = (q: string) => {
    setSearchQuery(q)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (q.trim()) {
      searchTimer.current = setTimeout(() => doSearch(q), 300)
    } else {
      setSearchResults([])
    }
  }

  const tabs = [
    {
      id: "bible",
      label: "Biblia",
      content: (
        <div className="p-4">
          {!bibleId ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8 py-16">
              <BookOpen size={48} className="text-[var(--accent)] mb-4 opacity-30" />
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
                Bible AI Studio
              </h3>
              <p className="text-sm text-[var(--text-tertiary)] leading-relaxed mb-2">
                1. En el panel izquierdo, activá <strong>RVR60</strong>
              </p>
              <p className="text-sm text-[var(--text-tertiary)] leading-relaxed mb-2">
                2. Hacé clic en un libro para leerlo
              </p>
              <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                3. Usá el botón <MessageSquare size={14} className="inline" /> IA arriba para el chat
              </p>
            </div>
          ) : !selectedBook ? (
            <div>
              <p className="text-xs text-[var(--text-tertiary)] px-1 pb-3 font-medium">
                LIBROS DEL ANTIGUO TESTAMENTO
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-px">
                {books.filter((b) => b.number <= 39).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleBookSelect(b)}
                    className="text-left px-2.5 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    {b.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[var(--text-tertiary)] px-1 pt-4 pb-3 font-medium">
                LIBROS DEL NUEVO TESTAMENTO
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-px">
                {books.filter((b) => b.number > 39).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleBookSelect(b)}
                    className="text-left px-2.5 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--border-color)]">
                <button
                  onClick={() => { setSelectedBook(null); setVerses([]) }}
                  className="text-xs text-[var(--accent)] hover:underline whitespace-nowrap"
                >
                  ← Biblioteca
                </button>
                <span className="text-xs text-[var(--text-tertiary)]">|</span>
                <button
                  onClick={() => setShowChapterPicker(!showChapterPicker)}
                  className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors whitespace-nowrap"
                >
                  {selectedBook.name} {selectedChapter}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => goChapter(-1)}
                    disabled={selectedChapter <= 1}
                    className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => goChapter(1)}
                    disabled={selectedChapter >= totalChapters}
                    className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                <span className="text-[10px] text-[var(--text-tertiary)] ml-auto">
                  cap. {selectedChapter} de {totalChapters}
                </span>
              </div>

              {showChapterPicker && (
                <div className="mb-4 p-2 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                  <div className="grid grid-cols-8 sm:grid-cols-10 gap-1 max-h-48 overflow-y-auto">
                    {Array.from({ length: totalChapters }, (_, i) => i + 1).map((ch) => (
                      <button
                        key={ch}
                        onClick={() => handleChapterSelect(ch)}
                        className={cn(
                          "px-2 py-1.5 rounded text-xs font-medium transition-colors",
                          ch === selectedChapter
                            ? "bg-[var(--accent)] text-white"
                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                        )}
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                {verses.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      const ref = `${selectedBook.name} ${selectedChapter}:${v.number}`
                      setSelectedVerse(ref)
                      dispatch({
                        type: "SET_CURRENT_VERSE",
                        payload: {
                          book: selectedBook.name,
                          chapter: selectedChapter,
                          verse: v.number,
                          text: v.text,
                          version: state.activeBibles[0]?.abbr ?? "",
                        },
                      })
                    }}
                    className={cn(
                      "w-full text-left p-2 rounded-lg transition-colors group",
                      selectedVerse === `${selectedBook.name} ${selectedChapter}:${v.number}`
                        ? "bg-[var(--accent-light)] border-l-2 border-[var(--accent)]"
                        : "hover:bg-[var(--bg-secondary)]"
                    )}
                  >
                    <sup className="text-xs font-semibold text-[var(--accent)] opacity-60 mr-1">
                      {v.number}
                    </sup>
                    <span className="text-[15px] leading-relaxed" style={{ fontFamily: "var(--font-serif)" }}>
                      {v.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "search",
      label: "Buscar",
      content: (
        <div className="p-4">
          {isSearching ? (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-8">Buscando...</p>
          ) : searchResults.length === 0 && searchQuery ? (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-8">
              Sin resultados para &ldquo;{searchQuery}&rdquo;
            </p>
          ) : (
            <div className="space-y-2">
              {searchResults.map((r, i) => {
                const parts = r.reference.split(" ")
                const chv = parts[parts.length - 1].split(":")
                return (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer border border-transparent hover:border-[var(--border-color)]"
                    onClick={() => {
                      dispatch({
                        type: "SET_CURRENT_VERSE",
                        payload: {
                          book: parts.slice(0, -1).join(" "),
                          chapter: parseInt(chv[0]),
                          verse: parseInt(chv[1]),
                          text: r.text,
                          version: state.activeBibles[0]?.abbr ?? "",
                        },
                      })
                      const book = books.find((b) => b.name === parts.slice(0, -1).join(" "))
                      if (book) handleBookSelect(book).then(() => handleChapterSelect(parseInt(chv[0])))
                    }}
                  >
                    <span className="text-xs font-semibold text-[var(--accent)]">{r.reference}</span>
                    <p className="text-sm mt-1 text-[var(--text-primary)]" style={{ fontFamily: "var(--font-serif)" }}>
                      {r.text}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[var(--border-color)] flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] focus-within:border-[var(--accent)] transition-colors">
          <Search size={14} className="text-[var(--text-tertiary)] shrink-0" />
          <input
            type="text"
            placeholder="Buscar en toda la Biblia..."
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
          />
        </div>
        <button className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors">
          <Bookmark size={16} />
        </button>
        <button className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors">
          <Highlighter size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  )
}
