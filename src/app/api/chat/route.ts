import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

type Provider = "openai" | "ollama" | "claude"

function getConfig() {
  return {
    provider: (process.env.LLM_PROVIDER as Provider) || "ollama",
    apiKey: process.env.OPENAI_API_KEY || "",
    model: process.env.LLM_MODEL || "",
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  }
}

function buildSystemPrompt(activeSources: string[]) {
  return `Eres un asistente de estudio bíblico. Tus funciones:
- Respondes SOLO con la información contenida en las Escrituras y recursos proporcionados.
- NO inventas información ni usas conocimiento externo.
- Cada afirmación debe ir acompañada de su referencia (libro, capítulo, versículo).
- Si no encuentras la respuesta en los textos proporcionados, dices honestamente que no tienes suficiente información.

Recursos activos del usuario:
${activeSources.map((s) => `- ${s}`).join("\n")}

Formato de respuesta:
1. Respuesta directa a la pregunta
2. Versículos relevantes con citas
3. Comentarios relacionados (si aplica)
4. Entradas de diccionario relacionadas (si aplica)`
}

async function searchBible(query: string, limit = 15) {
  const words = query.trim().split(/\s+/).filter(Boolean)
  const conditions = words.map((w) => ({ text: { contains: w } }))

  const verses = await prisma.verse.findMany({
    where: { AND: conditions },
    include: {
      chapter: {
        include: {
          book: { select: { name: true, abbreviation: true, number: true } },
        },
      },
    },
    take: limit,
  })

  return verses.map((v) => ({
    reference: `${v.chapter.book.name} ${v.chapter.number}:${v.number}`,
    text: v.text,
  }))
}

async function callOllama(messages: { role: string; content: string }[], model: string) {
  const config = getConfig()
  const res = await fetch(`${config.baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: model || "llama3.2",
      messages,
      stream: false,
    }),
  })
  const data = await res.json()
  return data.message?.content ?? ""
}

async function callOpenAI(messages: { role: string; content: string }[], model: string) {
  const config = getConfig()
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: model || "gpt-4o-mini",
      messages,
    }),
  })
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ""
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, activeBibles, activeCommentaries, activeDictionaries } = body

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const activeSources = [
      ...(activeBibles || []).map((b: { name: string }) => `Biblia: ${b.name}`),
      ...(activeCommentaries || []).map((c: { name: string }) => `Comentario: ${c.name}`),
      ...(activeDictionaries || []).map((d: { name: string }) => `Diccionario: ${d.name}`),
    ]

    const verses = await searchBible(message)
    const contextVerses = verses.map((v) => `${v.reference}: ${v.text}`).join("\n")

    const systemPrompt = buildSystemPrompt(activeSources.length > 0 ? activeSources : ["Biblia RVR60"])

    const messages = [
      { role: "system" as const, content: systemPrompt },
      {
        role: "user" as const,
        content: `Contexto bíblico relevante:\n${contextVerses}\n\nPregunta: ${message}`,
      },
    ]

    const config = getConfig()
    let response: string

    if (config.provider === "openai" && config.apiKey) {
      response = await callOpenAI(messages, config.model)
    } else {
      response = await callOllama(messages, config.model)
    }

    const sources = verses.slice(0, 5).map((v) => ({
      type: "verse" as const,
      reference: v.reference,
      label: v.reference,
    }))

    return NextResponse.json({
      response,
      sources,
    })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    )
  }
}
