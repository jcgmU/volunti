'use server';

import { db } from '@/db';
import { users, p2pProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { signUpSchema } from '@/lib/validations';
import { signIn } from '@/auth';
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { checkRateLimit, recordRateLimit } from '@/lib/rate-limit';
import { verifyTurnstileToken } from '@/lib/turnstile';

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

  const rateLimit = await checkRateLimit('signup', 5, 60);
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

    await db.insert(users).values({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: hashedPassword,
      authProvider: 'credentials',
      organizationId: null,
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
