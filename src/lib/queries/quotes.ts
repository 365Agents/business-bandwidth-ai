import { db } from "@/lib/db"

export async function getQuoteCount() {
  return db.quote.count()
}

export async function getPendingQuoteCount() {
  return db.quote.count({ where: { status: "pending" } })
}

export async function getRecentQuotes(limit = 10) {
  return db.quote.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { lead: true },
  })
}

export async function getQuoteById(id: string) {
  return db.quote.findUnique({
    where: { id },
    include: { lead: true },
  })
}
