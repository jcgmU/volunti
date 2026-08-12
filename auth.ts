import NextAuth, { DefaultSession } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { signInSchema } from './lib/validations';

declare module 'next-auth' {
  interface User {
    authProvider?: 'google' | 'credentials';
    organizationId?: string | null;
  }
  interface Session {
    user: {
      id: string;
      authProvider: 'google' | 'credentials';
      organizationId: string | null;
    } & DefaultSession['user']
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: 'jwt' },
  providers: [
    Google,
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const [user] = await db.select().from(users).where(eq(users.email, email));

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          authProvider: 'credentials',
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const email = user.email;
        if (!email) return false;
        const name = user.name || profile?.name || '';
        
        const [existingUser] = await db.select().from(users).where(eq(users.email, email));
        if (!existingUser) {
          await db.insert(users).values({
            email,
            name,
            authProvider: 'google',
            passwordHash: null,
            organizationId: null,
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const [dbUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, token.email || ''));
        if (dbUser) {
          token.id = dbUser.id;
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.authProvider = dbUser.authProvider;
          token.organizationId = dbUser.organizationId;
        }
      } else if (!token.organizationId) {
        const [dbUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, token.id as string));
        if (dbUser && dbUser.organizationId) {
          token.organizationId = dbUser.organizationId;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.authProvider = token.authProvider as 'google' | 'credentials';
        session.user.organizationId = token.organizationId as string | null;
      }
      return session;
    },
  },
});
