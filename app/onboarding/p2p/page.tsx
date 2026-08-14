import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { p2pProfiles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { P2PForm } from './components/p2p-form'
import { SiteHeader } from '@/components/site-header'

export default async function P2POnboardingPage() {
  const session = await auth()
  if (!session || !session.user || !session.user.id) {
    redirect('/login')
  }

  if (session.user.organizationId) {
    redirect('/app')
  }

  const [existing] = await db.select().from(p2pProfiles).where(eq(p2pProfiles.userId, session.user.id))
  if (existing) {
    redirect('/app')
  }

  return (
    <>
      <SiteHeader />
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-8">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Tu perfil solidario</h1>
            <p className="text-muted-foreground">
              Completa estos datos mínimos para poder publicar ofertas de donación o contactar con voluntarios.
            </p>
          </div>
          
          <P2PForm />
        </div>
      </div>
    </>
  )
}
