import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { organizations, p2pProfiles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { AppNav } from './components/app-nav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  if (!session || !session.user || !session.user.id) {
    redirect('/login')
  }

  let orgName = ''
  let userType: 'org' | 'p2p' | 'none' = 'none'

  if (session.user.organizationId) {
    const org = await db
      .select({ name: organizations.name })
      .from(organizations)
      .where(eq(organizations.id, session.user.organizationId))
      .limit(1)
    
    if (org.length > 0) {
      orgName = org[0].name
      userType = 'org'
    }
  } else {
    const [p2p] = await db
      .select({ id: p2pProfiles.id })
      .from(p2pProfiles)
      .where(eq(p2pProfiles.userId, session.user.id))
      .limit(1)
    
    if (p2p) {
      userType = 'p2p'
    }
  }

  return (
    <>
      <AppNav userName={session.user.name ?? ''} orgName={orgName} userType={userType} />
      <div className="md:hidden border-b px-4 py-3">
        <span className="font-heading text-lg font-semibold">Volunti Panel</span>
      </div>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <div className="md:ml-64 pb-20 md:pb-0">{children}</div>
      </main>
    </>
  )
}
