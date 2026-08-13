'use server'

import { auth } from '@/auth'
import { db } from '@/db'
import { p2pOffers, p2pRequests, p2pProfiles } from '@/db/schema'
import { and, eq, inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

async function getSessionOrRedirect() {
  const session = await auth()
  if (!session || !session.user || !session.user.id) {
    redirect('/login')
  }

  const [profile] = await db
    .select({ id: p2pProfiles.id, isBlocked: p2pProfiles.isBlocked })
    .from(p2pProfiles)
    .where(eq(p2pProfiles.userId, session.user.id))
    .limit(1)

  if (!profile) {
    redirect('/onboarding/p2p')
  }

  if (profile.isBlocked) {
    redirect('/app?error=blocked')
  }

  return session
}

export async function acceptRequestAction(requestId: string) {
  const session = await getSessionOrRedirect()
  const donorId = session.user.id as string

  try {
    // Double ownership check via JOIN
    const [existingRequest] = await db
      .select({ id: p2pRequests.id })
      .from(p2pRequests)
      .innerJoin(p2pOffers, eq(p2pRequests.offerId, p2pOffers.id))
      .where(and(
        eq(p2pRequests.id, requestId),
        eq(p2pOffers.donorId, donorId),
        eq(p2pRequests.status, 'pendiente')
      ))
      .limit(1)

    if (!existingRequest) {
      redirect('/app/donaciones/solicitudes?error=unauthorized')
    }

    await db
      .update(p2pRequests)
      .set({
        status: 'aceptada',
        updatedAt: new Date()
      })
      .where(
        and(
          eq(p2pRequests.id, requestId),
          eq(p2pRequests.status, 'pendiente'),
          inArray(
            p2pRequests.offerId,
            db.select({ id: p2pOffers.id }).from(p2pOffers).where(eq(p2pOffers.donorId, donorId))
          )
        )
      )

  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    console.error('DB Update failed for acceptRequestAction:', error)
    redirect('/app/donaciones/solicitudes?error=unknown')
  }

  revalidatePath('/app/donaciones/solicitudes')
}

export async function rejectRequestAction(requestId: string) {
  const session = await getSessionOrRedirect()
  const donorId = session.user.id as string

  try {
    const [existingRequest] = await db
      .select({ id: p2pRequests.id })
      .from(p2pRequests)
      .innerJoin(p2pOffers, eq(p2pRequests.offerId, p2pOffers.id))
      .where(and(
        eq(p2pRequests.id, requestId),
        eq(p2pOffers.donorId, donorId),
        eq(p2pRequests.status, 'pendiente')
      ))
      .limit(1)

    if (!existingRequest) {
      redirect('/app/donaciones/solicitudes?error=unauthorized')
    }

    await db
      .update(p2pRequests)
      .set({
        status: 'rechazada',
        updatedAt: new Date()
      })
      .where(
        and(
          eq(p2pRequests.id, requestId),
          eq(p2pRequests.status, 'pendiente'),
          inArray(
            p2pRequests.offerId,
            db.select({ id: p2pOffers.id }).from(p2pOffers).where(eq(p2pOffers.donorId, donorId))
          )
        )
      )

  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    console.error('DB Update failed for rejectRequestAction:', error)
    redirect('/app/donaciones/solicitudes?error=unknown')
  }

  revalidatePath('/app/donaciones/solicitudes')
}

export async function markAttendedAction(requestId: string) {
  const session = await getSessionOrRedirect()
  const donorId = session.user.id as string

  try {
    const [existingRequest] = await db
      .select({ id: p2pRequests.id })
      .from(p2pRequests)
      .innerJoin(p2pOffers, eq(p2pRequests.offerId, p2pOffers.id))
      .where(and(
        eq(p2pRequests.id, requestId),
        eq(p2pOffers.donorId, donorId),
        eq(p2pRequests.status, 'aceptada')
      ))
      .limit(1)

    if (!existingRequest) {
      redirect('/app/donaciones/solicitudes?error=unauthorized')
    }

    await db
      .update(p2pRequests)
      .set({
        status: 'atendida',
        updatedAt: new Date()
      })
      .where(
        and(
          eq(p2pRequests.id, requestId),
          eq(p2pRequests.status, 'aceptada'),
          inArray(
            p2pRequests.offerId,
            db.select({ id: p2pOffers.id }).from(p2pOffers).where(eq(p2pOffers.donorId, donorId))
          )
        )
      )

  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    console.error('DB Update failed for markAttendedAction:', error)
    redirect('/app/donaciones/solicitudes?error=unknown')
  }

  revalidatePath('/app/donaciones/solicitudes')
}
