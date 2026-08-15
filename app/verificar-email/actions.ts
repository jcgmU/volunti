'use server';

import { db } from '@/db';
import { users, emailVerificationTokens } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { sendEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';
import { randomUUID } from 'crypto';

export async function verifyEmailAction(token: string) {
  try {
    const [record] = await db
      .select()
      .from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.token, token));

    if (!record) {
      return { success: false, error: 'Token inválido o expirado.' };
    }

    const now = new Date();
    if (record.expiresAt < now) {
      return { success: false, error: 'Token inválido o expirado.' };
    }

    await db
      .update(users)
      .set({ emailVerified: now })
      .where(eq(users.id, record.userId));

    await db
      .delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.id, record.id));

    return { success: true };
  } catch (error) {
    console.error('Verify email error:', error);
    return { success: false, error: 'Algo salió mal. Por favor, intenta de nuevo.' };
  }
}

export async function resendVerificationEmailAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'No hay sesión activa.' };
  }

  const userId = session.user.id;

  const rateLimit = await checkRateLimit('resend_verification', 3, 60, userId);
  if (!rateLimit.success) {
    return { success: false, error: rateLimit.message || 'Demasiados intentos. Por favor, intenta más tarde.' };
  }

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return { success: false, error: 'Usuario no encontrado.' };
    }

    if (user.emailVerified) {
      return { success: false, error: 'El correo ya está verificado.' };
    }

    const [existingToken] = await db
      .select()
      .from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.userId, userId));

    let verificationToken: string;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    if (existingToken && existingToken.expiresAt > new Date()) {
      verificationToken = existingToken.token;
    } else {
      if (existingToken) {
        await db
          .delete(emailVerificationTokens)
          .where(eq(emailVerificationTokens.id, existingToken.id));
      }

      verificationToken = randomUUID();
      await db.insert(emailVerificationTokens).values({
        userId,
        token: verificationToken,
        expiresAt,
      });
    }

    await sendEmail({
      to: user.email,
      subject: 'Verificá tu correo electrónico — Volunti',
      html: `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #111;">Verificá tu correo electrónico</h2>
        <p>Para completar tu registro, hacé clic en el siguiente link:</p>
        <p style="margin: 24px 0;">
          <a href="https://volunti.co/verificar-email?token=${verificationToken}" style="display: inline-block; padding: 12px 24px; background: #111; color: #fff; text-decoration: none; border-radius: 6px;">Verificar mi correo</a>
        </p>
        <p style="color: #666; font-size: 14px;">Si no te registraste en Volunti, podés ignorar este mensaje. El link expira en 24 horas.</p>
      </div>`,
    });

    return { success: true };
  } catch (error) {
    console.error('Resend verification email error:', error);
    return { success: false, error: 'Algo salió mal. Por favor, intenta de nuevo.' };
  }
}
