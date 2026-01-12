import { db } from "@/lib/db"

export async function getLeadCount() {
  return db.lead.count()
}

export async function getRecentLeads(limit = 10) {
  return db.lead.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { quotes: true },
  })
}

export async function getLeadById(id: string) {
  return db.lead.findUnique({
    where: { id },
    include: { quotes: true },
  })
}
