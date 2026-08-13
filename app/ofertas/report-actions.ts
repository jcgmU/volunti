'use server'

import { auth } from '@/auth'
import { db } from '@/db'
import { p2pReports, p2pOffers, p2pProfiles } from '@/db/schema'
import { and, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

export async function reportAction(targetType: 'offer' | 'profile', targetId: string, reason: string) {
  const session = await auth()
  if (!session || !session.user || !session.user.id) {
    redirect('/login')
  }

  const reporterId = session.user.id

  // Check if profile exists and is blocked
  const [profile] = await db
    .select({ id: p2pProfiles.id, isBlocked: p2pProfiles.isBlocked })
    .from(p2pProfiles)
    .where(eq(p2pProfiles.userId, reporterId))
    .limit(1)

  if (!profile) {
    return { error: 'Necesitas completar tu perfil para realizar esta acción.' }
  }

  if (profile.isBlocked) {
    return { error: 'Tu perfil está bloqueado. No puedes realizar esta acción.' }
  }

  try {
    // Anti-duplicado
    const [existingReport] = await db
      .select({ id: p2pReports.id })
      .from(p2pReports)
      .where(
        and(
          eq(p2pReports.reporterId, reporterId),
          eq(p2pReports.targetType, targetType),
          eq(p2pReports.targetId, targetId)
        )
      )
      .limit(1)

    if (existingReport) {
      return { error: 'Ya reportaste esto anteriormente.' }
    }

    // Insertar reporte
    await db.insert(p2pReports).values({
      reporterId,
      targetType,
      targetId,
      reason
    })

    // Auto-bloqueo: contar reportes para este target
    const targetReportsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(p2pReports)
      .where(
        and(
          eq(p2pReports.targetType, targetType),
          eq(p2pReports.targetId, targetId)
        )
      )

    const count = Number(targetReportsCount[0]?.count || 0)

    if (count >= 3) {
      if (targetType === 'offer') {
        await db
          .update(p2pOffers)
          .set({ status: 'bloqueada' })
          .where(eq(p2pOffers.id, targetId))
      } else if (targetType === 'profile') {
        await db
          .update(p2pProfiles)
          .set({ isBlocked: true })
          .where(eq(p2pProfiles.id, targetId))
      }
    }

    revalidatePath('/ofertas')
    return { success: true }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    console.error('DB Insert failed for p2p report:', error)
    return { error: 'Algo salió mal. Por favor, intenta de nuevo.' }
  }
}
