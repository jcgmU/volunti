import { auth } from '@/auth'
import { db } from '@/db'
import { p2pOffers, p2pRequests, p2pProfiles } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { RequestActions } from './components/request-actions'
import Image from 'next/image'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const CATEGORY_LABELS: Record<string, string> = {
  alimentos: 'Alimentos',
  agua: 'Agua',
  salud: 'Salud y Medicina',
  vivienda: 'Vivienda y Refugio',
  ropa: 'Ropa y Abrigo',
  higiene: 'Kits de Higiene',
  rescate: 'Búsqueda y Rescate',
  psicosocial: 'Apoyo Psicosocial',
  educación: 'Educación y Recreación',
  transporte: 'Transporte y Logística',
  mano_de_obra: 'Mano de Obra y Técnicos'
}

export default async function SolicitudesRecibidasPage() {
  const session = await auth()
  if (!session || !session.user || !session.user.id) {
    redirect('/login')
  }

  const donorId = session.user.id

  const [profile] = await db
    .select({ id: p2pProfiles.id, isBlocked: p2pProfiles.isBlocked })
    .from(p2pProfiles)
    .where(eq(p2pProfiles.userId, donorId))
    .limit(1)

  if (!profile) {
    redirect('/onboarding/p2p')
  }

  if (profile.isBlocked) {
    redirect('/app?error=blocked')
  }

  // Get all requests for offers owned by this donor
  const requests = await db
    .select({
      id: p2pRequests.id,
      message: p2pRequests.message,
      status: p2pRequests.status,
      createdAt: p2pRequests.createdAt,
      offerId: p2pOffers.id,
      offerCategory: p2pOffers.category,
      offerDescription: p2pOffers.description,
      requesterAlias: p2pProfiles.alias,
      requesterAvatar: p2pProfiles.avatarUrl
    })
    .from(p2pRequests)
    .innerJoin(p2pOffers, eq(p2pRequests.offerId, p2pOffers.id))
    .innerJoin(p2pProfiles, eq(p2pRequests.requesterId, p2pProfiles.userId))
    .where(eq(p2pOffers.donorId, donorId))
    .orderBy(desc(p2pRequests.createdAt))

  const statusColors = {
    pendiente: 'bg-amber-100 text-amber-800 border-amber-200',
    aceptada: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rechazada: 'bg-destructive/10 text-destructive border-destructive/20',
    atendida: 'bg-blue-100 text-blue-800 border-blue-200'
  }

  return (
    <div className="container py-8 px-4 max-w-5xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Solicitudes Recibidas</h1>
          <p className="text-muted-foreground mt-1">
            Gestioná las personas que solicitaron tus donaciones.
          </p>
        </div>
        <Link href="/app/donaciones" passHref>
          <Button variant="outline" size="lg" className="h-12 w-full sm:w-auto px-6">
            Volver a Mis Donaciones
          </Button>
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="border border-dashed rounded-xl p-12 text-center max-w-md mx-auto mt-8 bg-card">
          <p className="text-lg font-semibold text-muted-foreground">Aún no hay solicitudes</p>
          <p className="text-sm text-muted-foreground mt-1">
            Cuando alguien solicite alguna de tus donaciones, aparecerá acá.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="border rounded-xl p-5 bg-card flex flex-col md:flex-row gap-5 hover:shadow-sm transition-shadow">
              
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-full bg-muted border overflow-hidden relative shrink-0">
                  {req.requesterAvatar ? (
                    <Image src={req.requesterAvatar} alt="Avatar" fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-muted-foreground">
                      {req.requesterAlias?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-base leading-tight">{req.requesterAlias}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(req.createdAt), "d 'de' MMMM, yyyy - HH:mm", { locale: es })}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border whitespace-nowrap ${statusColors[req.status as keyof typeof statusColors]}`}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </div>

                  <div className="bg-muted/40 p-3 rounded-lg border">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Oferta solicitada
                    </p>
                    <p className="text-sm font-medium">
                      [{CATEGORY_LABELS[req.offerCategory] || req.offerCategory}] {req.offerDescription}
                    </p>
                  </div>

                  {req.message && (
                    <div className="text-sm pt-1">
                      <span className="font-semibold text-muted-foreground mr-2">Mensaje:</span>
                      <span className="italic text-foreground">&quot;{req.message}&quot;</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-center items-end gap-2 md:pl-4 md:border-l shrink-0">
                <RequestActions requestId={req.id} status={req.status as 'pendiente' | 'aceptada' | 'rechazada' | 'atendida'} />
              </div>
              
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
