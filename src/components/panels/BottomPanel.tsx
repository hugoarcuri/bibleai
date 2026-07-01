"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/ScrollArea"
import { useBibleStore } from "@/stores/bibleStore"
import { ChevronUp, ChevronDown, Clock, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const { state, dispatch } = useBibleStore()

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 py-1.5 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors w-full"
      >
        <Clock size={14} />
        Historial de consultas
        <ChevronUp size={14} />
      </button>
    )
  }

  return (
    <div className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <Clock size={14} />
          <span>Historial de consultas</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ChevronDown size={14} />
        </button>
      </div>
      <ScrollArea className="max-h-32">
        {state.conversations.length === 0 ? (
          <p className="px-4 py-3 text-xs text-[var(--text-tertiary)] text-center">
            No hay consultas anteriores. Tus conversaciones aparecerán aquí.
          </p>
        ) : (
          <div className="px-2 pb-2 space-y-1">
            {state.conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => dispatch({ type: "SET_ACTIVE_CONVERSATION", payload: conv.id })}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center gap-2",
                  state.activeConversationId === conv.id
                    ? "bg-[var(--accent-light)] text-[var(--accent)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                )}
              >
                <MessageSquare size={12} />
                <span className="truncate flex-1">{conv.title || "Conversación sin título"}</span>
                <span className="text-[var(--text-tertiary)] text-[10px]">
                  {conv.messages.length} mensajes
                </span>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
