import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? ""
  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit")) || 20, 100)

  if (!q.trim()) {
    return NextResponse.json({ verses: [], commentaries: [], dictionaries: [] })
  }

  const words = q.trim().split(/\s+/).filter(Boolean)
  const conditions = words.map((w) => ({ text: { contains: w } }))

  const verses = await prisma.verse.findMany({
    where: { AND: conditions },
    include: {
      chapter: {
        include: {
          book: {
            select: { name: true, abbreviation: true, number: true },
          },
        },
      },
    },
    take: limit,
    orderBy: [
      { chapter: { book: { number: "asc" } } },
      { chapter: { number: "asc" } },
      { number: "asc" },
    ],
  })

  const result = verses.map((v) => ({
    id: v.id,
    reference: `${v.chapter.book.name} ${v.chapter.number}:${v.number}`,
    abbreviation: `${v.chapter.book.abbreviation} ${v.chapter.number}:${v.number}`,
    text: v.text,
    book: v.chapter.book.name,
    chapter: v.chapter.number,
    verse: v.number,
  }))

  return NextResponse.json({ verses: result })
}
