import { getDb } from "@/lib/db"

export async function getLeadCount() {
  const db = await getDb()
  return db.lead.count()
}

export async function getRecentLeads(limit = 10) {
  const db = await getDb()
  return db.lead.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { quotes: true },
  })
}

export async function getLeadById(id: string) {
  const db = await getDb()
  return db.lead.findUnique({
    where: { id },
    include: { quotes: true },
  })
}
