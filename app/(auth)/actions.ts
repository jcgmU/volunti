'use server';

import { db } from '@/db';
import { users, p2pProfiles, emailVerificationTokens, passwordResetTokens } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { signUpSchema } from '@/lib/validations';
import { signIn } from '@/auth';
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { checkRateLimit, recordRateLimit } from '@/lib/rate-limit';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { sendEmail } from '@/lib/email';
import { randomUUID } from 'crypto';

export async function signUpAction(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const token = formData.get('cf-turnstile-response') as string | null;

  const isHuman = await verifyTurnstileToken(token);
  if (!isHuman) {
    redirect('/registro?error=captcha');
  }

  const parsed = signUpSchema.safeParse({ name, email, password });
  if (!parsed.success) {
    redirect('/registro?error=invalid');
  }

  const rateLimit = await checkRateLimit('signup', 20, 60);
  if (!rateLimit.success) {
    redirect('/registro?error=ratelimit');
  }

  try {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, parsed.data.email));

    if (existingUser) {
      redirect('/registro?error=email_taken');
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

    const [newUser] = await db.insert(users).values({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: hashedPassword,
      authProvider: 'credentials',
      organizationId: null,
    }).returning({ id: users.id });

    if (!newUser) {
      redirect('/registro?error=unknown');
    }

    const verificationToken = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await db.insert(emailVerificationTokens).values({
      userId: newUser.id,
      token: verificationToken,
      expiresAt,
    });

    await sendEmail({
      to: parsed.data.email,
      subject: 'Verificá tu correo electrónico — Volunti',
      html: `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #111;">Verificá tu correo electrónico</h2>
        <p>Gracias por registrarte en Volunti. Para completar tu registro, hacé clic en el siguiente link:</p>
        <p style="margin: 24px 0;">
          <a href="https://volunti.co/verificar-email?token=${verificationToken}" style="display: inline-block; padding: 12px 24px; background: #111; color: #fff; text-decoration: none; border-radius: 6px;">Verificar mi correo</a>
        </p>
        <p style="color: #666; font-size: 14px;">Si no te registraste en Volunti, podés ignorar este mensaje. El link expira en 24 horas.</p>
      </div>`,
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error('Sign up registration error:', error);
    redirect('/registro?error=unknown');
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: '/elegir-rol',
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error('Sign in error after registration:', error);
    redirect('/login?error=unknown');
  }
}

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const token = formData.get('cf-turnstile-response') as string | null;

  const isHuman = await verifyTurnstileToken(token);
  if (!isHuman) {
    redirect('/login?error=captcha');
  }

  let existingUser;
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    existingUser = user;
  } catch (error) {
    console.error('Error querying user on login:', error);
    redirect('/login?error=unknown');
  }

  const rateLimit = await checkRateLimit('login_failed', 10, 15, email, false);
  if (!rateLimit.success) {
    redirect('/login?error=ratelimit');
  }

  if (!existingUser) {
    await recordRateLimit('login_failed', email);
    redirect('/login?error=invalid');
  }

  let hasP2pProfile = false;
  if (!existingUser.organizationId) {
    const [p2p] = await db.select().from(p2pProfiles).where(eq(p2pProfiles.userId, existingUser.id));
    hasP2pProfile = !!p2p;
  }

  const redirectTo = (existingUser.organizationId || hasP2pProfile) ? '/app' : '/elegir-rol';

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo,
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    await recordRateLimit('login_failed', email);
    redirect('/login?error=invalid');
  }
}

export async function signInWithGoogle() {
  try {
    await signIn('google', { redirectTo: '/app' });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    redirect('/login?error=unknown');
  }
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = formData.get('email') as string;
  const token = formData.get('cf-turnstile-response') as string | null;

  const isHuman = await verifyTurnstileToken(token);
  if (!isHuman) {
    return { success: false, error: 'Por favor, completa el CAPTCHA para continuar.' };
  }

  const rateLimit = await checkRateLimit('password_reset_request', 5, 60);
  if (!rateLimit.success) {
    return { success: false, error: rateLimit.message || 'Demasiados intentos. Por favor, intenta de nuevo más tarde.' };
  }

  const [existingUser] = await db.select().from(users).where(eq(users.email, email));
  
  if (existingUser) {
    const resetToken = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await db.insert(passwordResetTokens).values({
      email,
      token: resetToken,
      expiresAt,
    });

    await sendEmail({
      to: email,
      subject: 'Restablecer contraseña — Volunti',
      html: `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #111;">Restablecer contraseña</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña en Volunti. Si fuiste vos, hacé clic en el siguiente link:</p>
        <p style="margin: 24px 0;">
          <a href="https://volunti.co/login/resetear?token=${resetToken}" style="display: inline-block; padding: 12px 24px; background: #111; color: #fff; text-decoration: none; border-radius: 6px;">Crear nueva contraseña</a>
        </p>
        <p style="color: #666; font-size: 14px;">Si no solicitaste este cambio, podés ignorar este mensaje. El link expira en 1 hora.</p>
      </div>`,
    });
  }

  // Always return success to not reveal if email exists
  return { success: true };
}

export async function resetPasswordAction(token: string, password: string) {
  try {
    const [record] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));

    if (!record) {
      return { success: false, error: 'Link inválido o expirado. Por favor, solicita uno nuevo.' };
    }

    const now = new Date();
    if (record.expiresAt < now) {
      return { success: false, error: 'Link inválido o expirado. Por favor, solicita uno nuevo.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db
      .update(users)
      .set({ passwordHash: hashedPassword })
      .where(eq(users.email, record.email));

    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.id, record.id));

    return { success: true };
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, error: 'Algo salió mal. Por favor, intenta de nuevo.' };
  }
}
