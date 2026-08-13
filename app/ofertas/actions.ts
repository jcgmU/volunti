'use server'

import { auth } from '@/auth'
import { db } from '@/db'
import { p2pRequests, p2pProfiles } from '@/db/schema'
import { and, eq, gte, sql } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

export async function createRequestAction(offerId: string, message?: string) {
  const session = await auth()
  if (!session || !session.user || !session.user.id) {
    redirect('/login')
  }

  const requesterId = session.user.id

  const [profile] = await db
    .select({ id: p2pProfiles.id })
    .from(p2pProfiles)
    .where(eq(p2pProfiles.userId, requesterId))
    .limit(1)

  if (!profile) {
    redirect('/onboarding/p2p')
  }

  try {
    // Check rate limit: max 5 requests per day
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const recentRequests = await db
      .select({ count: sql<number>`count(*)` })
      .from(p2pRequests)
      .where(
        and(
          eq(p2pRequests.requesterId, requesterId),
          gte(p2pRequests.createdAt, oneDayAgo)
        )
      )

    const count = Number(recentRequests[0]?.count || 0)
    if (count >= 5) {
      return { error: 'Alcanzaste el límite de 5 solicitudes por día. Probá de nuevo mañana.' }
    }

    // Check anti-duplicate: already a pending request for this offer
    const [existingRequest] = await db
      .select({ id: p2pRequests.id })
      .from(p2pRequests)
      .where(
        and(
          eq(p2pRequests.offerId, offerId),
          eq(p2pRequests.requesterId, requesterId),
          eq(p2pRequests.status, 'pendiente')
        )
      )
      .limit(1)

    if (existingRequest) {
      return { error: 'Ya tenés una solicitud pendiente para esta oferta.' }
    }

    // Insert
    await db.insert(p2pRequests).values({
      offerId,
      requesterId,
      message: message || null,
      status: 'pendiente'
    })

    return { success: true }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    console.error('DB Insert failed for p2p request:', error)
    return { error: 'Algo salió mal. Por favor, intentá de nuevo.' }
  }
}
