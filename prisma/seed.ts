import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(process.cwd(), ".env") })

import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const dbUrl = `file:///${resolve(process.cwd(), "dev.db").replace(/\\/g, "/")}`

const prisma = new PrismaClient({
  adapter: new PrismaLibSql({
    url: dbUrl,
  }),
})

const API_BASE = "https://bible-api.deno.dev/api/read"

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function toApiBookName(name: string): string {
  const map: Record<string, string> = {
    "Génesis": "genesis",
    "Éxodo": "exodo",
    "Levítico": "levitico",
    "Números": "numeros",
    "Deuteronomio": "deuteronomio",
    "Josué": "josue",
    "Jueces": "jueces",
    "Rut": "rut",
    "1 Samuel": "1-samuel",
    "2 Samuel": "2-samuel",
    "1 Reyes": "1-reyes",
    "2 Reyes": "2-reyes",
    "1 Crónicas": "1-cronicas",
    "2 Crónicas": "2-cronicas",
    "Esdras": "esdras",
    "Nehemías": "nehemias",
    "Ester": "ester",
    "Job": "job",
    "Salmos": "salmos",
    "Proverbios": "proverbios",
    "Eclesiastés": "eclesiastes",
    "Cantares": "cantares",
    "Isaías": "isaias",
    "Jeremías": "jeremias",
    "Lamentaciones": "lamentaciones",
    "Ezequiel": "ezequiel",
    "Daniel": "daniel",
    "Oseas": "oseas",
    "Joel": "joel",
    "Amós": "amos",
    "Abdías": "abdias",
    "Jonás": "jonas",
    "Miqueas": "miqueas",
    "Nahum": "nahum",
    "Habacuc": "habacuc",
    "Sofonías": "sofonias",
    "Hageo": "hageo",
    "Zacarías": "zacarias",
    "Malaquías": "malaquias",
    "Mateo": "mateo",
    "Marcos": "marcos",
    "Lucas": "lucas",
    "Juan": "juan",
    "Hechos": "hechos",
    "Romanos": "romanos",
    "1 Corintios": "1-corintios",
    "2 Corintios": "2-corintios",
    "Gálatas": "galatas",
    "Efesios": "efesios",
    "Filipenses": "filipenses",
    "Colosenses": "colosenses",
    "1 Tesalonicenses": "1-tesalonicenses",
    "2 Tesalonicenses": "2-tesalonicenses",
    "1 Timoteo": "1-timoteo",
    "2 Timoteo": "2-timoteo",
    "Tito": "tito",
    "Filemón": "filemon",
    "Hebreos": "hebreos",
    "Santiago": "santiago",
    "1 Pedro": "1-pedro",
    "2 Pedro": "2-pedro",
    "1 Juan": "1-juan",
    "2 Juan": "2-juan",
    "3 Juan": "3-juan",
    "Judas": "judas",
    "Apocalipsis": "apocalipsis",
  }
  return map[name] ?? name.toLowerCase().replace(/ /g, "-")
}

async function fetchChapter(version: string, bookName: string, chapter: number): Promise<{ number: number; text: string }[]> {
  const url = `${API_BASE}/${version}/${bookName}/${chapter}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API ${res.status} for ${url}`)
  const data = await res.json()
  if (!data.vers || !Array.isArray(data.vers)) {
    throw new Error(`Unexpected response for ${bookName} ${chapter}`)
  }
  return data.vers.map((v: { verse: string; number: number }) => ({
    number: v.number,
    text: v.verse,
  }))
}

async function seedBible(versionCode: string, name: string, abbr: string, books: { number: number; name: string; abbreviation: string; testament: string; chapters: number }[]) {
  const bible = await prisma.bibleVersion.create({
    data: { name, abbr, language: "es", year: 0, isActive: true },
  })

  for (const bookData of books) {
    const book = await prisma.book.create({
      data: {
        bibleVersionId: bible.id,
        number: bookData.number,
        name: bookData.name,
        abbreviation: bookData.abbreviation,
        testament: bookData.testament,
      },
    })

    const chapterRecords: { id: string; number: number }[] = []
    for (let c = 1; c <= bookData.chapters; c++) {
      const ch = await prisma.chapter.create({ data: { bookId: book.id, number: c } })
      chapterRecords.push(ch)
    }

    const apiName = toApiBookName(bookData.name)
    for (let c = 1; c <= bookData.chapters; c++) {
      try {
        const verses = await fetchChapter(versionCode, apiName, c)
        const ch = chapterRecords[c - 1]
        await prisma.verse.createMany({
          data: verses.map((v) => ({ chapterId: ch.id, number: v.number, text: v.text })),
        })
        console.log(`  ${bookData.name} ${c}: ${verses.length} versículos`)
        if (c % 5 === 0) await sleep(200)
      } catch (err) {
        console.error(`  ✗ Error ${bookData.name} ${c}:`, err instanceof Error ? err.message : err)
      }
    }
    console.log(`  ${bookData.name} (${bookData.chapters} capítulos)`)
  }
  return bible
}

const books = [
  { number: 1, name: "Génesis", abbreviation: "Gn", testament: "VT", chapters: 50 },
  { number: 2, name: "Éxodo", abbreviation: "Ex", testament: "VT", chapters: 40 },
  { number: 3, name: "Levítico", abbreviation: "Lv", testament: "VT", chapters: 27 },
  { number: 4, name: "Números", abbreviation: "Nm", testament: "VT", chapters: 36 },
  { number: 5, name: "Deuteronomio", abbreviation: "Dt", testament: "VT", chapters: 34 },
  { number: 6, name: "Josué", abbreviation: "Jos", testament: "VT", chapters: 24 },
  { number: 7, name: "Jueces", abbreviation: "Jue", testament: "VT", chapters: 21 },
  { number: 8, name: "Rut", abbreviation: "Rt", testament: "VT", chapters: 4 },
  { number: 9, name: "1 Samuel", abbreviation: "1S", testament: "VT", chapters: 31 },
  { number: 10, name: "2 Samuel", abbreviation: "2S", testament: "VT", chapters: 24 },
  { number: 11, name: "1 Reyes", abbreviation: "1R", testament: "VT", chapters: 22 },
  { number: 12, name: "2 Reyes", abbreviation: "2R", testament: "VT", chapters: 25 },
  { number: 13, name: "1 Crónicas", abbreviation: "1Cr", testament: "VT", chapters: 29 },
  { number: 14, name: "2 Crónicas", abbreviation: "2Cr", testament: "VT", chapters: 36 },
  { number: 15, name: "Esdras", abbreviation: "Esd", testament: "VT", chapters: 10 },
  { number: 16, name: "Nehemías", abbreviation: "Neh", testament: "VT", chapters: 13 },
  { number: 17, name: "Ester", abbreviation: "Est", testament: "VT", chapters: 10 },
  { number: 18, name: "Job", abbreviation: "Job", testament: "VT", chapters: 42 },
  { number: 19, name: "Salmos", abbreviation: "Sal", testament: "VT", chapters: 150 },
  { number: 20, name: "Proverbios", abbreviation: "Pr", testament: "VT", chapters: 31 },
  { number: 21, name: "Eclesiastés", abbreviation: "Ec", testament: "VT", chapters: 12 },
  { number: 22, name: "Cantares", abbreviation: "Cnt", testament: "VT", chapters: 8 },
  { number: 23, name: "Isaías", abbreviation: "Is", testament: "VT", chapters: 66 },
  { number: 24, name: "Jeremías", abbreviation: "Jer", testament: "VT", chapters: 52 },
  { number: 25, name: "Lamentaciones", abbreviation: "Lm", testament: "VT", chapters: 5 },
  { number: 26, name: "Ezequiel", abbreviation: "Ez", testament: "VT", chapters: 48 },
  { number: 27, name: "Daniel", abbreviation: "Dn", testament: "VT", chapters: 12 },
  { number: 28, name: "Oseas", abbreviation: "Os", testament: "VT", chapters: 14 },
  { number: 29, name: "Joel", abbreviation: "Jl", testament: "VT", chapters: 3 },
  { number: 30, name: "Amós", abbreviation: "Am", testament: "VT", chapters: 9 },
  { number: 31, name: "Abdías", abbreviation: "Abd", testament: "VT", chapters: 1 },
  { number: 32, name: "Jonás", abbreviation: "Jon", testament: "VT", chapters: 4 },
  { number: 33, name: "Miqueas", abbreviation: "Miq", testament: "VT", chapters: 7 },
  { number: 34, name: "Nahum", abbreviation: "Nah", testament: "VT", chapters: 3 },
  { number: 35, name: "Habacuc", abbreviation: "Hab", testament: "VT", chapters: 3 },
  { number: 36, name: "Sofonías", abbreviation: "Sof", testament: "VT", chapters: 3 },
  { number: 37, name: "Hageo", abbreviation: "Hg", testament: "VT", chapters: 2 },
  { number: 38, name: "Zacarías", abbreviation: "Zac", testament: "VT", chapters: 14 },
  { number: 39, name: "Malaquías", abbreviation: "Mal", testament: "VT", chapters: 4 },
  { number: 40, name: "Mateo", abbreviation: "Mt", testament: "NT", chapters: 28 },
  { number: 41, name: "Marcos", abbreviation: "Mr", testament: "NT", chapters: 16 },
  { number: 42, name: "Lucas", abbreviation: "Lc", testament: "NT", chapters: 24 },
  { number: 43, name: "Juan", abbreviation: "Jn", testament: "NT", chapters: 21 },
  { number: 44, name: "Hechos", abbreviation: "Hch", testament: "NT", chapters: 28 },
  { number: 45, name: "Romanos", abbreviation: "Ro", testament: "NT", chapters: 16 },
  { number: 46, name: "1 Corintios", abbreviation: "1Co", testament: "NT", chapters: 16 },
  { number: 47, name: "2 Corintios", abbreviation: "2Co", testament: "NT", chapters: 13 },
  { number: 48, name: "Gálatas", abbreviation: "Gá", testament: "NT", chapters: 6 },
  { number: 49, name: "Efesios", abbreviation: "Ef", testament: "NT", chapters: 6 },
  { number: 50, name: "Filipenses", abbreviation: "Fil", testament: "NT", chapters: 4 },
  { number: 51, name: "Colosenses", abbreviation: "Col", testament: "NT", chapters: 4 },
  { number: 52, name: "1 Tesalonicenses", abbreviation: "1Ts", testament: "NT", chapters: 5 },
  { number: 53, name: "2 Tesalonicenses", abbreviation: "2Ts", testament: "NT", chapters: 3 },
  { number: 54, name: "1 Timoteo", abbreviation: "1Ti", testament: "NT", chapters: 6 },
  { number: 55, name: "2 Timoteo", abbreviation: "2Ti", testament: "NT", chapters: 4 },
  { number: 56, name: "Tito", abbreviation: "Tit", testament: "NT", chapters: 3 },
  { number: 57, name: "Filemón", abbreviation: "Flm", testament: "NT", chapters: 1 },
  { number: 58, name: "Hebreos", abbreviation: "Heb", testament: "NT", chapters: 13 },
  { number: 59, name: "Santiago", abbreviation: "Stg", testament: "NT", chapters: 5 },
  { number: 60, name: "1 Pedro", abbreviation: "1P", testament: "NT", chapters: 5 },
  { number: 61, name: "2 Pedro", abbreviation: "2P", testament: "NT", chapters: 3 },
  { number: 62, name: "1 Juan", abbreviation: "1Jn", testament: "NT", chapters: 5 },
  { number: 63, name: "2 Juan", abbreviation: "2Jn", testament: "NT", chapters: 1 },
  { number: 64, name: "3 Juan", abbreviation: "3Jn", testament: "NT", chapters: 1 },
  { number: 65, name: "Judas", abbreviation: "Jud", testament: "NT", chapters: 1 },
  { number: 66, name: "Apocalipsis", abbreviation: "Ap", testament: "NT", chapters: 22 },
]

async function main() {
  console.log("Clearing existing data...")
  await prisma.verse.deleteMany()
  await prisma.chapter.deleteMany()
  await prisma.book.deleteMany()
  await prisma.bibleVersion.deleteMany()

  console.log("Seeding RVR60...")
  await seedBible("rv1960", "Reina Valera 1960", "RVR60", books)

  console.log("Seeding NVI...")
  await seedBible("nvi", "Nueva Versión Internacional", "NVI", books)

  const pending = [
    { name: "Nueva Traducción Viviente", abbr: "NTV", language: "es", year: 2009 },
  ]
  for (const b of pending) {
    await prisma.bibleVersion.upsert({ where: { abbr: b.abbr }, update: {}, create: b })
    console.log(`✓ ${b.name} (pendiente de API)`)
  }

  console.log("¡Seed completado!")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
