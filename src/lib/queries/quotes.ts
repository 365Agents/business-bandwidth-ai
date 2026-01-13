import { getDb } from "@/lib/db"

export async function getQuoteCount() {
  const db = await getDb()
  return db.quote.count()
}

export async function getPendingQuoteCount() {
  const db = await getDb()
  return db.quote.count({ where: { status: "pending" } })
}

export async function getRecentQuotes(limit = 10) {
  const db = await getDb()
  return db.quote.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { lead: true },
  })
}

export async function getQuoteById(id: string) {
  const db = await getDb()
  return db.quote.findUnique({
    where: { id },
    include: { lead: true },
  })
}
