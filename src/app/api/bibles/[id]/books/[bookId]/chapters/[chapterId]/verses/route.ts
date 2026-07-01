import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; bookId: string; chapterId: string }> }
) {
  const { bookId, chapterId } = await params
  const chapter = await prisma.chapter.findFirst({
    where: { id: chapterId, bookId },
  })
  if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 })

  const verses = await prisma.verse.findMany({
    where: { chapterId: chapter.id },
    select: { id: true, number: true, text: true },
    orderBy: { number: "asc" },
  })
  return NextResponse.json(verses)
}
