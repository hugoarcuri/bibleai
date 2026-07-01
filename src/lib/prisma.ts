import { PrismaClient } from "@/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import { resolve } from "path"

function getDbUrl(): string {
  const env = process.env.DATABASE_URL ?? "file:./dev.db"
  if (!env.startsWith("file:")) return env
  const path = env.slice(5)
  if (path.startsWith("./") || path.startsWith(".\\")) {
    const abs = resolve(process.cwd(), path)
    return `file:///${abs.replace(/\\/g, "/")}`
  }
  return env
}

const adapter = new PrismaLibSql({ url: getDbUrl() })
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
