import { headers } from 'next/headers';
import { db } from '@/db';
import { rateLimits } from '@/db/schema';
import { and, gte, eq, sql } from 'drizzle-orm';

export async function getClientIp() {
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  let ip = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp;
  
  if (!ip) {
    ip = 'unknown-ip';
  }
  return ip;
}

export async function checkRateLimit(
  action: string,
  limit: number,
  windowMinutes: number,
  identifier?: string,
  recordAttempt: boolean = true
): Promise<{ success: boolean; message?: string }> {
  try {
    const ip = await getClientIp();
    const key = identifier ? `${action}:${ip}:${identifier}` : `${action}:${ip}`;
    
    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - windowMinutes);

    const recentAttempts = await db
      .select({ count: sql<number>`count(*)` })
      .from(rateLimits)
      .where(
        and(
          eq(rateLimits.key, key),
          gte(rateLimits.createdAt, windowStart)
        )
      );

    const count = Number(recentAttempts[0]?.count || 0);

    if (count >= limit) {
      return { success: false, message: 'Demasiados intentos. Por favor intenta más tarde.' };
    }

    if (recordAttempt) {
      await db.insert(rateLimits).values({ key });
    }

    return { success: true };
  } catch (error) {
    console.error('Rate limit error:', error);
    return { success: true };
  }
}

export async function recordRateLimit(
  action: string,
  identifier?: string
) {
  try {
    const ip = await getClientIp();
    const key = identifier ? `${action}:${ip}:${identifier}` : `${action}:${ip}`;
    await db.insert(rateLimits).values({ key });
  } catch (error) {
    console.error('Rate limit record error:', error);
  }
}
