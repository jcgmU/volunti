import { db } from '@/db'
import { p2pOffers, p2pProfiles } from '@/db/schema'
import { and, eq, desc, ne } from 'drizzle-orm'
import { auth } from '@/auth'
import Image from 'next/image'
import Link from 'next/link'
import { RequestButton } from './components/request-button'
import { ReportButton } from './components/report-button'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

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

interface PageProps {
  searchParams: Promise<{
    ciudad?: string
    categoria?: string
  }>
}

export default async function OfertasPage({ searchParams }: PageProps) {
  const session = await auth()
  const userId = session?.user?.id

  let sessionState: 'no-session' | 'no-profile' | 'ready' = 'no-session'

  if (userId) {
    const [profile] = await db
      .select({ id: p2pProfiles.id })
      .from(p2pProfiles)
      .where(eq(p2pProfiles.userId, userId))
      .limit(1)
    
    sessionState = profile ? 'ready' : 'no-profile'
  }

  const params = await searchParams
  const filterCiudad = params.ciudad
  const filterCategoria = params.categoria

  const conditions = [eq(p2pOffers.status, 'activa')]
  
  if (filterCiudad) {
    // Basic exact match for MVP
    conditions.push(eq(p2pOffers.city, filterCiudad))
  }
  
  if (filterCategoria) {
    conditions.push(eq(p2pOffers.category, filterCategoria))
  }

  if (userId) {
    // Exclude own offers
    conditions.push(ne(p2pOffers.donorId, userId))
  }

  const offers = await db
    .select({
      id: p2pOffers.id,
      category: p2pOffers.category,
      description: p2pOffers.description,
      availability: p2pOffers.availability,
      city: p2pOffers.city,
      zone: p2pOffers.zone,
      photoUrl: p2pOffers.photoUrl,
      alias: p2pProfiles.alias,
      avatarUrl: p2pProfiles.avatarUrl,
      donorId: p2pOffers.donorId,
      donorProfileId: p2pProfiles.id,
      createdAt: p2pOffers.createdAt
    })
    .from(p2pOffers)
    .leftJoin(p2pProfiles, eq(p2pOffers.donorId, p2pProfiles.userId))
    .where(and(...conditions))
    .orderBy(desc(p2pOffers.createdAt))

  // Get unique cities for filter
  const allCities = await db
    .select({ city: p2pOffers.city })
    .from(p2pOffers)
    .where(eq(p2pOffers.status, 'activa'))

  const uniqueCities = Array.from(new Set(allCities.map(c => c.city))).sort()

  return (
    <div className="min-h-screen bg-muted/20">
      
      <SiteHeader active="ofertas" />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Ofertas de Ayuda (P2P)</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Explora las donaciones y ayudas ofrecidas por personas y organizaciones en todo el país.
          </p>
        </div>

        {/* Filtros básicos */}
        <div className="bg-background border rounded-xl p-4 mb-8 flex flex-col sm:flex-row gap-4">
          <form className="flex-1 flex flex-col sm:flex-row gap-4" method="GET" action="/ofertas">
            <div className="flex-1">
              <label htmlFor="ciudad" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Ciudad</label>
              <select 
                id="ciudad" 
                name="ciudad" 
                defaultValue={filterCiudad || ''}
                className="w-full h-10 px-3 rounded-md border bg-transparent text-sm"
              >
                <option value="">Todas las ciudades</option>
                {uniqueCities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <label htmlFor="categoria" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Categoría</label>
              <select 
                id="categoria" 
                name="categoria" 
                defaultValue={filterCategoria || ''}
                className="w-full h-10 px-3 rounded-md border bg-transparent text-sm"
              >
                <option value="">Todas las categorías</option>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <Button type="submit" className="h-10">Filtrar</Button>
              {(filterCiudad || filterCategoria) && (
                <Link href="/ofertas" passHref>
                  <Button type="button" variant="outline" className="h-10">Limpiar</Button>
                </Link>
              )}
            </div>
          </form>
        </div>

        {offers.length === 0 ? (
          <div className="border border-dashed rounded-xl p-12 text-center max-w-md mx-auto mt-8 bg-background">
            <p className="text-lg font-semibold text-muted-foreground">No hay ofertas activas</p>
            <p className="text-sm text-muted-foreground mt-1">
              No encontramos ofertas que coincidan con tus filtros.
            </p>
            {(filterCiudad || filterCategoria) && (
              <Link href="/ofertas" passHref className="mt-4 block">
                <Button variant="outline">Ver todas las ofertas</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div key={offer.id} className="bg-background border rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                
                <div className="relative w-full aspect-video bg-muted border-b">
                  {offer.photoUrl ? (
                    <Image src={offer.photoUrl} alt="Foto de la donación" fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm font-medium">
                      Sin foto
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-foreground">
                      {CATEGORY_LABELS[offer.category] || offer.category}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-3 text-foreground mb-4">
                      {offer.description}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span className="truncate" title={`${offer.city}${offer.zone ? `, ${offer.zone}` : ''}`}>
                          {offer.city}{offer.zone ? `, ${offer.zone}` : ''}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="truncate" title={offer.availability}>
                          {offer.availability}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted border overflow-hidden relative shrink-0">
                      {offer.avatarUrl ? (
                        <Image src={offer.avatarUrl} alt="Avatar" fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-muted-foreground">
                          {offer.alias?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground leading-tight">Ofrecido por</p>
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-semibold truncate leading-tight">{offer.alias || 'Usuario Anónimo'}</p>
                        {sessionState === 'ready' && offer.donorProfileId && (
                          <ReportButton targetType="profile" targetId={offer.donorProfileId} iconOnly />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 flex items-center justify-between gap-2">
                    <RequestButton offerId={offer.id} sessionState={sessionState} />
                    {sessionState === 'ready' && (
                      <ReportButton targetType="offer" targetId={offer.id} iconOnly />
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
