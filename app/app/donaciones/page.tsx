import { auth } from '@/auth'
import { db } from '@/db'
import { p2pOffers, p2pProfiles } from '@/db/schema'
import { and, eq, desc } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StatusSelect } from './components/status-select'
import { OfferForm } from './components/offer-form'
import { deleteOfferAction } from './actions'
import Image from 'next/image'

interface PageProps {
  searchParams: Promise<{
    action?: string
    offerId?: string
    error?: string
    success?: string
  }>
}

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

export default async function DonacionesPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session || !session.user || !session.user.id) {
    redirect('/login')
  }

  const userId = session.user.id

  const [profile] = await db
    .select({ id: p2pProfiles.id, isBlocked: p2pProfiles.isBlocked })
    .from(p2pProfiles)
    .where(eq(p2pProfiles.userId, userId))
    .limit(1)

  if (!profile) {
    redirect('/onboarding/p2p')
  }

  if (profile.isBlocked) {
    redirect('/app?error=blocked')
  }

  const params = await searchParams
  const action = params.action
  const editOfferId = params.offerId
  const success = params.success
  const error = params.error

  const errorMessages: Record<string, string> = {
    invalid: 'Datos inválidos o faltantes. Por favor, revisá los campos.',
    unauthorized: 'No tenés permisos para realizar esta acción.',
    unknown: 'Algo salió mal. Por favor, intenta de nuevo.'
  }

  const successMessages: Record<string, string> = {
    created: '¡Donación publicada con éxito!',
    updated: '¡Donación actualizada con éxito!',
    deleted: 'Donación eliminada correctamente.'
  }

  const errorMessage = error ? errorMessages[error] || errorMessages.unknown : null
  const successMessage = success ? successMessages[success] : null

  let editOffer: typeof p2pOffers.$inferSelect | null = null
  if (action === 'edit' && editOfferId) {
    const [fetchedOffer] = await db
      .select()
      .from(p2pOffers)
      .where(and(eq(p2pOffers.id, editOfferId), eq(p2pOffers.donorId, userId)))
    
    if (fetchedOffer) {
      editOffer = fetchedOffer
    } else {
      redirect('/app/donaciones?error=unauthorized')
    }
  }

  if (action === 'new' || (action === 'edit' && editOffer)) {
    return (
      <div className="container py-8 px-4 max-w-4xl mx-auto">
        <OfferForm offer={editOffer} />
      </div>
    )
  }

  const items = await db
    .select()
    .from(p2pOffers)
    .where(eq(p2pOffers.donorId, userId))
    .orderBy(desc(p2pOffers.updatedAt))

  return (
    <div className="container py-8 px-4 max-w-5xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Donaciones</h1>
          <p className="text-muted-foreground mt-1">
            Gestioná la ayuda humanitaria que estás ofreciendo.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Link href="/app/donaciones/solicitudes" passHref>
            <Button variant="secondary" size="lg" className="h-12 text-base font-semibold w-full sm:w-auto px-6">
              Solicitudes recibidas
            </Button>
          </Link>
          <Link href="/app/donaciones?action=new" passHref>
            <Button size="lg" className="h-12 text-base font-semibold w-full sm:w-auto px-6">
              Publicar donación
            </Button>
          </Link>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg bg-destructive/15 p-4 text-sm text-destructive font-medium">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-900 font-medium">
          {successMessage}
        </div>
      )}

      {items.length === 0 ? (
        <div className="border border-dashed rounded-xl p-12 text-center max-w-md mx-auto mt-8">
          <p className="text-lg font-semibold text-muted-foreground">No tenés donaciones publicadas</p>
          <p className="text-sm text-muted-foreground mt-1">
            Publicá tu primera oferta de ayuda para que otras personas o fundaciones puedan solicitarla.
          </p>
          <Link href="/app/donaciones?action=new" passHref className="mt-4 block">
            <Button variant="outline">Comenzar a ayudar</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="block md:hidden space-y-4">
            {items.map((item) => (
              <div key={item.id} className={`border rounded-xl p-4 bg-card space-y-3 ${item.status === 'bloqueada' ? 'opacity-70' : ''}`}>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground inline-block mb-1">
                      {CATEGORY_LABELS[item.category] || item.category}
                    </span>
                    <p className="text-sm font-medium mt-1 line-clamp-2 text-foreground">{item.description}</p>
                  </div>
                  {item.status === 'bloqueada' ? (
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-destructive/10 text-destructive border border-destructive/20 whitespace-nowrap">
                      Bloqueada
                    </span>
                  ) : (
                    <StatusSelect offerId={item.id} currentStatus={item.status as 'activa' | 'pausada' | 'completada'} />
                  )}
                </div>
                
                {item.photoUrl && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                    <Image src={item.photoUrl} alt="Foto de la donación" fill className="object-cover" />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-2 text-sm pt-1">
                  <div>
                    <p className="text-muted-foreground text-xs">Ubicación</p>
                    <p className="font-semibold text-foreground truncate">{item.city}{item.zone ? `, ${item.zone}` : ''}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Disponibilidad</p>
                    <p className="font-semibold text-foreground truncate" title={item.availability}>{item.availability}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t text-sm">
                  <Link href={`/app/donaciones?action=edit&offerId=${item.id}`} passHref>
                    <Button variant="outline" size="sm" disabled={item.status === 'bloqueada'}>
                      Editar
                    </Button>
                  </Link>
                  <form action={deleteOfferAction}>
                    <input type="hidden" name="offerId" value={item.id} />
                    <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
                      Eliminar
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block border rounded-xl overflow-hidden bg-card">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b text-sm font-semibold text-muted-foreground">
                  <th className="p-4 w-16">Foto</th>
                  <th className="p-4">Detalle</th>
                  <th className="p-4">Disponibilidad</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Ubicación</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y">
                {items.map((item) => (
                  <tr key={item.id} className={`hover:bg-muted/10 transition ${item.status === 'bloqueada' ? 'opacity-70 bg-destructive/5' : ''}`}>
                    <td className="p-4">
                      {item.photoUrl ? (
                        <div className="relative w-12 h-12 rounded border overflow-hidden">
                          <Image src={item.photoUrl} alt="Foto" fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded border bg-muted flex items-center justify-center text-muted-foreground text-xs">
                          S/F
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-foreground max-w-[200px]">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground inline-block mb-1">
                          {CATEGORY_LABELS[item.category] || item.category}
                        </span>
                        <p className="truncate font-normal" title={item.description}>{item.description}</p>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-foreground">
                      <p className="truncate max-w-[150px]" title={item.availability}>{item.availability}</p>
                    </td>
                    <td className="p-4">
                      {item.status === 'bloqueada' ? (
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-destructive/10 text-destructive border border-destructive/20 whitespace-nowrap">
                          Bloqueada (Moderación)
                        </span>
                      ) : (
                        <StatusSelect offerId={item.id} currentStatus={item.status as 'activa' | 'pausada' | 'completada'} />
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      <p className="truncate max-w-[150px]" title={`${item.city}${item.zone ? `, ${item.zone}` : ''}`}>
                        {item.city}{item.zone ? `, ${item.zone}` : ''}
                      </p>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Link href={`/app/donaciones?action=edit&offerId=${item.id}`} passHref>
                          <Button variant="outline" size="sm" disabled={item.status === 'bloqueada'}>
                            Editar
                          </Button>
                        </Link>
                        <form action={deleteOfferAction}>
                          <input type="hidden" name="offerId" value={item.id} />
                          <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
                            Eliminar
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="pt-4 flex justify-start">
        <Link href="/app" passHref>
          <Button variant="link" className="px-0">
            ← Volver a mi panel
          </Button>
        </Link>
      </div>

    </div>
  )
}
