import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const bibles = await prisma.bibleVersion.findMany({
    where: { isActive: true },
    select: { id: true, name: true, abbr: true, language: true, year: true },
  })
  return NextResponse.json(bibles)
}
