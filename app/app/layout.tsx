import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { organizations } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { AppNav } from './components/app-nav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  if (!session || !session.user || !session.user.id) {
    redirect('/login')
  }

  let orgName = ''
  if (session.user.organizationId) {
    const org = await db
      .select({ name: organizations.name })
      .from(organizations)
      .where(eq(organizations.id, session.user.organizationId))
      .limit(1)
    
    if (org.length > 0) {
      orgName = org[0].name
    }
  }

  return (
    <>
      <AppNav userName={session.user.name ?? ''} orgName={orgName} />
      <div className="md:ml-64 pb-20 md:pb-0">
        {children}
      </div>
    </>
  )
}
