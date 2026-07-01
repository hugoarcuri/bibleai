export interface BibleResource {
  id: string
  name: string
  abbr: string
  language: string
  isActive: boolean
}

export interface CommentaryResource {
  id: string
  name: string
  author: string
  isActive: boolean
}

export interface DictionaryResource {
  id: string
  name: string
  author: string
  isActive: boolean
}

export interface LibraryCategory {
  id: string
  name: string
  type: "bible" | "commentary" | "dictionary" | "atlas" | "resource"
  items: (BibleResource | CommentaryResource | DictionaryResource)[]
}

export interface VerseReference {
  book: string
  chapter: number
  verse: number
  text: string
  version: string
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: Source[]
  timestamp: Date
}

export interface Source {
  type: "verse" | "commentary" | "dictionary"
  reference: string
  label: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface SearchResult {
  verses: VerseReference[]
  commentaries: { title: string; content: string; source: string }[]
  dictionary: { word: string; definition: string; source: string }[]
}
