'use server';

import { db } from '@/db';
import { p2pReports, users, p2pOffers, p2pProfiles } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function getReportsAction() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    throw new Error('Unauthorized');
  }

  const reports = await db
    .select({
      id: p2pReports.id,
      reason: p2pReports.reason,
      createdAt: p2pReports.createdAt,
      targetType: p2pReports.targetType,
      targetId: p2pReports.targetId,
      reporterName: users.name,
    })
    .from(p2pReports)
    .innerJoin(users, eq(p2pReports.reporterId, users.id))
    .orderBy(desc(p2pReports.createdAt));

  const enrichedReports = await Promise.all(
    reports.map(async (report) => {
      let targetInfo = '';
      let isBlocked = false;

      if (report.targetType === 'offer') {
        const [offer] = await db
          .select({ description: p2pOffers.description, status: p2pOffers.status })
          .from(p2pOffers)
          .where(eq(p2pOffers.id, report.targetId));
        
        if (offer) {
          targetInfo = offer.description;
          isBlocked = offer.status === 'bloqueada';
        } else {
          targetInfo = '[Oferta eliminada]';
        }
      } else if (report.targetType === 'profile') {
        const [profile] = await db
          .select({ alias: p2pProfiles.alias, isBlocked: p2pProfiles.isBlocked })
          .from(p2pProfiles)
          .where(eq(p2pProfiles.id, report.targetId));
        
        if (profile) {
          targetInfo = profile.alias;
          isBlocked = profile.isBlocked;
        } else {
          targetInfo = '[Perfil eliminado]';
        }
      }

      return {
        ...report,
        targetInfo,
        isBlocked,
      };
    })
  );

  return enrichedReports;
}

export async function unblockTargetAction(reportId: string) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const [report] = await db
      .select()
      .from(p2pReports)
      .where(eq(p2pReports.id, reportId));

    if (!report) {
      return { success: false, error: 'Report not found' };
    }

    if (report.targetType === 'offer') {
      await db
        .update(p2pOffers)
        .set({ status: 'activa' })
        .where(eq(p2pOffers.id, report.targetId));
    } else if (report.targetType === 'profile') {
      await db
        .update(p2pProfiles)
        .set({ isBlocked: false })
        .where(eq(p2pProfiles.id, report.targetId));
    }

    revalidatePath('/app/admin');
    return { success: true };
  } catch (error) {
    console.error('Unblock target error:', error);
    return { success: false, error: 'Algo salió mal' };
  }
}
