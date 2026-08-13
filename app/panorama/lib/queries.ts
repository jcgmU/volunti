import { db } from '@/db'
import { needs, populations, organizations, inventory, volunteers } from '@/db/schema'
import { eq, and, desc, asc, inArray, sql } from 'drizzle-orm'
import { PanoramaFilters } from './filters'

export async function getCitiesForNeeds() {
  const rows = await db.execute(sql`SELECT DISTINCT city FROM ${populations} JOIN ${needs} ON ${populations.id} = ${needs.populationId} ORDER BY city`)
  return rows.rows.map((r: Record<string, unknown>) => r.city as string).filter(Boolean)
}

export async function getCitiesForInventory() {
  const rows = await db.execute(sql`SELECT DISTINCT location AS city FROM ${inventory} ORDER BY city`)
  return rows.rows.map((r: Record<string, unknown>) => r.city as string).filter(Boolean)
}

export async function getCitiesForVolunteers() {
  const rows = await db.execute(sql`SELECT DISTINCT city FROM ${volunteers} ORDER BY city`)
  return rows.rows.map((r: Record<string, unknown>) => r.city as string).filter(Boolean)
}

export async function getSkills() {
  const rows = await db.execute(sql`SELECT DISTINCT unnest(skills) AS skill FROM ${volunteers} ORDER BY skill`)
  return rows.rows.map((r: Record<string, unknown>) => r.skill as string).filter(Boolean)
}

export async function getNeeds(filters: PanoramaFilters) {
  const { ciudad, categoria, urgencia } = filters
  return db
    .select({ need: needs, population: populations, org: organizations })
    .from(needs)
    .leftJoin(populations, eq(needs.populationId, populations.id))
    .leftJoin(organizations, eq(needs.reportedByOrgId, organizations.id))
    .where(and(
      ciudad ? eq(populations.city, ciudad) : undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      categoria ? eq(needs.category, categoria as any) : undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      urgencia ? eq(needs.urgency, urgencia as any) : undefined,
    ))
    .orderBy(desc(needs.updatedAt))
}

export async function getInventory(filters: PanoramaFilters) {
  const { ciudad, categoria } = filters
  return db
    .select({ inv: inventory, org: organizations })
    .from(inventory)
    .leftJoin(organizations, eq(inventory.organizationId, organizations.id))
    .where(and(
      ciudad ? eq(inventory.location, ciudad) : undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      categoria ? eq(inventory.category, categoria as any) : undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      inArray(inventory.status, ['disponible', 'reservado'] as any),
    ))
    .orderBy(desc(inventory.updatedAt))
}

export async function getVolunteers(filters: PanoramaFilters) {
  const { ciudad, skill, disponibilidad } = filters
  return db
    .select({ v: volunteers, org: organizations })
    .from(volunteers)
    .leftJoin(organizations, eq(volunteers.organizationId, organizations.id))
    .where(and(
      ciudad ? eq(volunteers.city, ciudad) : undefined,
      skill ? sql`${volunteers.skills}::text[] @> ARRAY[${skill}]::text[]` : undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      disponibilidad ? eq(volunteers.status, disponibilidad as any) : eq(volunteers.status, 'disponible' as any),
    ))
    .orderBy(asc(volunteers.name))
}

export async function getPopulations() {
  return db
    .select()
    .from(populations)
    .orderBy(asc(populations.name))
}
