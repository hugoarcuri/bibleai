import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const { chapterId } = await params
  const verses = await prisma.verse.findMany({
    where: { chapterId },
    select: { id: true, number: true, text: true },
    orderBy: { number: "asc" },
  })
  return NextResponse.json(verses)
}
