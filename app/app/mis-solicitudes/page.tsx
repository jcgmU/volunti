import { auth } from '@/auth'
import { db } from '@/db'
import { p2pOffers, p2pRequests, p2pProfiles } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
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

export default async function MisSolicitudesPage() {
  const session = await auth()
  if (!session || !session.user || !session.user.id) {
    redirect('/login')
  }

  const requesterId = session.user.id

  const [profile] = await db
    .select({ id: p2pProfiles.id, isBlocked: p2pProfiles.isBlocked })
    .from(p2pProfiles)
    .where(eq(p2pProfiles.userId, requesterId))
    .limit(1)

  if (!profile) {
    redirect('/onboarding/p2p')
  }

  if (profile.isBlocked) {
    redirect('/app?error=blocked')
  }

  // Get all requests made by this user
  const requests = await db
    .select({
      id: p2pRequests.id,
      message: p2pRequests.message,
      status: p2pRequests.status,
      createdAt: p2pRequests.createdAt,
      offerId: p2pOffers.id,
      offerCategory: p2pOffers.category,
      offerDescription: p2pOffers.description,
      offerCity: p2pOffers.city,
      offerZone: p2pOffers.zone,
      offerPhotoUrl: p2pOffers.photoUrl,
      donorAlias: p2pProfiles.alias,
      donorAvatar: p2pProfiles.avatarUrl,
      donorPhone: p2pProfiles.phone
    })
    .from(p2pRequests)
    .innerJoin(p2pOffers, eq(p2pRequests.offerId, p2pOffers.id))
    // the donor's profile
    .innerJoin(p2pProfiles, eq(p2pOffers.donorId, p2pProfiles.userId))
    .where(eq(p2pRequests.requesterId, requesterId))
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
          <h1 className="text-3xl font-bold tracking-tight">Mis Solicitudes</h1>
          <p className="text-muted-foreground mt-1">
            Seguimiento de las donaciones que solicitaste.
          </p>
        </div>
        <Link href="/ofertas" passHref>
          <Button variant="outline" size="lg" className="h-12 w-full sm:w-auto px-6">
            Explorar más ofertas
          </Button>
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="border border-dashed rounded-xl p-12 text-center max-w-md mx-auto mt-8 bg-card">
          <p className="text-lg font-semibold text-muted-foreground">No solicitaste ninguna donación</p>
          <p className="text-sm text-muted-foreground mt-1">
            Explora las ofertas de ayuda disponibles y conéctate con personas que pueden ayudarte.
          </p>
          <Link href="/ofertas" passHref className="mt-4 block">
            <Button variant="outline">Ir a Ofertas</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="border rounded-xl p-5 bg-card flex flex-col md:flex-row gap-5 hover:shadow-sm transition-shadow">
              
              <div className="flex items-start gap-4 flex-1">
                <div className="w-16 h-16 rounded-lg bg-muted border overflow-hidden relative shrink-0">
                  {req.offerPhotoUrl ? (
                    <Image src={req.offerPhotoUrl} alt="Foto de la donación" fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-muted-foreground">
                      Sin foto
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground inline-block mb-1">
                        {CATEGORY_LABELS[req.offerCategory] || req.offerCategory}
                      </span>
                      <p className="font-semibold text-base leading-tight text-foreground">{req.offerDescription}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {req.offerCity}{req.offerZone ? `, ${req.offerZone}` : ''}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border whitespace-nowrap ${statusColors[req.status as keyof typeof statusColors]}`}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                    <div className="w-6 h-6 rounded-full bg-muted border overflow-hidden relative shrink-0">
                      {req.donorAvatar ? (
                        <Image src={req.donorAvatar} alt="Avatar" fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                          {req.donorAlias?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Ofrecido por <span className="text-foreground">{req.donorAlias}</span>
                    </p>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {format(new Date(req.createdAt), "d 'de' MMM, yyyy", { locale: es })}
                    </span>
                  </div>
                </div>
              </div>

              {req.status === 'aceptada' && (
                <div className="flex flex-col justify-center items-end gap-2 md:pl-4 md:border-l shrink-0">
                  <p className="text-xs font-medium text-emerald-700 text-center w-full md:text-right mb-1">
                    ¡Solicitud Aceptada!
                  </p>
                  <a
                    href={`https://wa.me/${req.donorPhone}?text=${encodeURIComponent(`Hola! Te contacto por tu oferta de ayuda en Volunti sobre ${CATEGORY_LABELS[req.offerCategory] || req.offerCategory}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button
                      size="sm"
                      className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                      </svg>
                      Contactar por WhatsApp
                    </Button>
                  </a>
                </div>
              )}
              
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
