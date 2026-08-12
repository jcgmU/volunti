'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { signUpSchema } from '@/lib/validations';
import { signIn } from '@/auth';
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

export async function signUpAction(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const parsed = signUpSchema.safeParse({ name, email, password });
  if (!parsed.success) {
    redirect('/registro?error=invalid');
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
      redirectTo: '/app',
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

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/app',
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
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
