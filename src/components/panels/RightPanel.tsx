"use client"

import { useState, useRef } from "react"
import { ScrollArea } from "@/components/ui/ScrollArea"
import { useBibleStore } from "@/stores/bibleStore"
import { Send, Sparkles, Plus } from "lucide-react"
import type { Message } from "@/types"

const suggestions = [
  "¿Qué significa el nuevo nacimiento?",
  "¿Qué enseñó Pablo sobre la gracia?",
  "Versículos sobre el amor de Dios",
  "Explicación de Juan 3:16",
]

const mockResponses: Record<string, { response: string; sources: { label: string; type: string; reference: string }[] }> = {
  "nuevo nacimiento": {
    response: `El nuevo nacimiento es un concepto central en el Evangelio de Juan.

**Juan 3:3** — "Respondió Jesús y le dijo: De cierto, de cierto te digo, que el que no naciere de nuevo, no puede ver el reino de Dios."

**Juan 3:5** — "Respondió Jesús: De cierto, de cierto te digo, que el que no naciere de agua y del Espíritu, no puede entrar en el reino de Dios."

**Juan 3:7** — "No te maravilles de que te dije: Os es necesario nacer de nuevo."

El nuevo nacimiento es una obra del Espíritu Santo que transforma al creyente, permitiéndole entrar al reino de Dios. No es un esfuerzo humano, sino un acto divino.`,
    sources: [
      { type: "verse", reference: "Juan 3:3", label: "Juan 3:3" },
      { type: "verse", reference: "Juan 3:5", label: "Juan 3:5" },
      { type: "verse", reference: "Juan 3:7", label: "Juan 3:7" },
    ],
  },
}

export function RightPanel() {
  const { state } = useBibleStore()
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const getMockResponse = (q: string) => {
    const lower = q.toLowerCase()
    for (const [key, val] of Object.entries(mockResponses)) {
      if (lower.includes(key)) return val
    }
    if (lower.includes("gracia")) {
      return {
        response: `La gracia es un tema fundamental en las enseñanzas de Pablo.

**Efesios 2:8** — "Porque por gracia sois salvos por medio de la fe; y esto no de vosotros, pues es don de Dios."

**Romanos 3:24** — "siendo justificados gratuitamente por su gracia, mediante la redención que es en Cristo Jesús."

**Romanos 5:20-21** — "donde abundó el pecado, sobreabundó la gracia."

La gracia (charis) es el favor inmerecido de Dios hacia el pecador. Pablo la presenta como la base de la salvación, completamente separada de las obras humanas.`,
        sources: [
          { type: "verse", reference: "Efesios 2:8", label: "Efesios 2:8" },
          { type: "verse", reference: "Romanos 3:24", label: "Romanos 3:24" },
          { type: "verse", reference: "Romanos 5:20-21", label: "Romanos 5:20-21" },
        ],
      }
    }
    return {
      response: `Basado en los textos disponibles:\n\n**${q}**\n\nPodés buscar en la Biblia usando el buscador del panel central o seleccionar un libro para leer. Para respuestas más específicas, conectá Ollama (http://localhost:11434) o configurá OpenAI en el archivo .env.`,
      sources: [],
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: input, timestamp: new Date() }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          activeBibles: state.activeBibles,
          activeCommentaries: state.activeCommentaries,
          activeDictionaries: state.activeDictionaries,
        }),
      })

      if (!res.ok) throw new Error("API not available")

      const data = await res.json()

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response || "Sin respuesta.",
        sources: data.sources || [],
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      const mock = getMockResponse(input)
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: mock.response,
        sources: mock.sources.map((s) => ({
          type: s.type as "verse" | "commentary" | "dictionary",
          reference: s.reference,
          label: s.label,
        })),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[var(--border-color)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[var(--accent)]" />
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Asistente IA</h2>
        </div>
        <button onClick={() => setMessages([])} className="flex items-center gap-1 px-2 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-tertiary)]">
          <Plus size={14} /> Nueva
        </button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Sparkles size={32} className="text-[var(--accent)] mb-3 opacity-50" />
            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">¿Qué deseas estudiar?</h3>
            <p className="text-xs text-[var(--text-tertiary)] mb-6 max-w-xs">
              Preguntá en lenguaje natural. La IA responde usando los textos bíblicos disponibles.
            </p>
            <div className="space-y-2 w-full max-w-sm">
              {suggestions.map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); inputRef.current?.focus() }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)]"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] ${msg.role === "user"
                  ? "bg-[var(--accent)] text-white rounded-2xl rounded-tr-md px-4 py-2.5"
                  : "bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl rounded-tl-md px-4 py-2.5"
                }`}>
                  <div className="text-sm whitespace-pre-wrap leading-relaxed" style={msg.role === "user" ? {} : { fontFamily: "var(--font-serif)" }}>
                    {msg.content}
                  </div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
                      <p className="text-xs font-medium text-[var(--text-tertiary)] mb-2">Fuentes</p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((src, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                            {src.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl rounded-tl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[var(--text-tertiary)] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-[var(--text-tertiary)] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-[var(--text-tertiary)] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t border-[var(--border-color)]">
        <div className="flex items-end gap-2 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] p-2 focus-within:border-[var(--accent)] transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Escribí tu pregunta..."
            rows={1}
            className="flex-1 bg-transparent text-sm outline-none resize-none px-2 py-1 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] max-h-32"
          />
          <button onClick={handleSend} disabled={!input.trim() || isLoading} className="p-2 rounded-xl bg-[var(--accent)] text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
