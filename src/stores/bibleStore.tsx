"use client"

import { createContext, useContext, useReducer, type ReactNode } from "react"
import type { BibleResource, CommentaryResource, DictionaryResource, Conversation, Message, VerseReference } from "@/types"

interface BibleState {
  activeBibles: BibleResource[]
  activeCommentaries: CommentaryResource[]
  activeDictionaries: DictionaryResource[]
  currentVerse: VerseReference | null
  conversations: Conversation[]
  activeConversationId: string | null
  theme: "light" | "dark"
  sidebarOpen: boolean
}

type BibleAction =
  | { type: "SET_ACTIVE_BIBLES"; payload: BibleResource[] }
  | { type: "TOGGLE_BIBLE"; payload: BibleResource }
  | { type: "SET_ACTIVE_COMMENTARIES"; payload: CommentaryResource[] }
  | { type: "TOGGLE_COMMENTARY"; payload: CommentaryResource }
  | { type: "SET_ACTIVE_DICTIONARIES"; payload: DictionaryResource[] }
  | { type: "TOGGLE_DICTIONARY"; payload: DictionaryResource }
  | { type: "SET_CURRENT_VERSE"; payload: VerseReference | null }
  | { type: "ADD_CONVERSATION"; payload: Conversation }
  | { type: "SET_ACTIVE_CONVERSATION"; payload: string | null }
  | { type: "ADD_MESSAGE"; payload: { conversationId: string; message: Message } }
  | { type: "TOGGLE_THEME" }
  | { type: "TOGGLE_SIDEBAR" }

const initialState: BibleState = {
  activeBibles: [],
  activeCommentaries: [],
  activeDictionaries: [],
  currentVerse: null,
  conversations: [],
  activeConversationId: null,
  theme: "light",
  sidebarOpen: true,
}

function bibleReducer(state: BibleState, action: BibleAction): BibleState {
  switch (action.type) {
    case "SET_ACTIVE_BIBLES":
      return { ...state, activeBibles: action.payload }
    case "TOGGLE_BIBLE": {
      const exists = state.activeBibles.find((b) => b.id === action.payload.id)
      return {
        ...state,
        activeBibles: exists
          ? state.activeBibles.filter((b) => b.id !== action.payload.id)
          : [...state.activeBibles, action.payload],
      }
    }
    case "TOGGLE_COMMENTARY": {
      const exists = state.activeCommentaries.find((c) => c.id === action.payload.id)
      return {
        ...state,
        activeCommentaries: exists
          ? state.activeCommentaries.filter((c) => c.id !== action.payload.id)
          : [...state.activeCommentaries, action.payload],
      }
    }
    case "TOGGLE_DICTIONARY": {
      const exists = state.activeDictionaries.find((d) => d.id === action.payload.id)
      return {
        ...state,
        activeDictionaries: exists
          ? state.activeDictionaries.filter((d) => d.id !== action.payload.id)
          : [...state.activeDictionaries, action.payload],
      }
    }
    case "SET_CURRENT_VERSE":
      return { ...state, currentVerse: action.payload }
    case "ADD_CONVERSATION":
      return {
        ...state,
        conversations: [...state.conversations, action.payload],
        activeConversationId: action.payload.id,
      }
    case "SET_ACTIVE_CONVERSATION":
      return { ...state, activeConversationId: action.payload }
    case "ADD_MESSAGE": {
      const conversations = state.conversations.map((c) => {
        if (c.id === action.payload.conversationId) {
          return { ...c, messages: [...c.messages, action.payload.message] }
        }
        return c
      })
      return { ...state, conversations }
    }
    case "TOGGLE_THEME":
      return { ...state, theme: state.theme === "light" ? "dark" : "light" }
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarOpen: !state.sidebarOpen }
    default:
      return state
  }
}

interface BibleContextType {
  state: BibleState
  dispatch: React.Dispatch<BibleAction>
}

const BibleContext = createContext<BibleContextType | undefined>(undefined)

export function BibleProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bibleReducer, initialState)
  return <BibleContext.Provider value={{ state, dispatch }}>{children}</BibleContext.Provider>
}

export function useBibleStore() {
  const context = useContext(BibleContext)
  if (!context) throw new Error("useBibleStore must be used within BibleProvider")
  return context
}
