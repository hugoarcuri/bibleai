import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const { bookId } = await params
  const chapters = await prisma.chapter.findMany({
    where: { bookId },
    select: { id: true, number: true },
    orderBy: { number: "asc" },
  })
  return NextResponse.json(chapters)
}
