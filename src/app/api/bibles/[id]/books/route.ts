import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const books = await prisma.book.findMany({
    where: { bibleVersionId: id },
    select: { id: true, number: true, name: true, abbreviation: true, testament: true },
    orderBy: { number: "asc" },
  })
  return NextResponse.json(books)
}
