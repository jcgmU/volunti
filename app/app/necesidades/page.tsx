import { auth } from '@/auth'
import { db } from '@/db'
import { needs, populations } from '@/db/schema'
import { and, eq, desc, asc } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StatusSelect } from './components/status-select'
import { NeedForm } from './components/need-form'
import { deleteNeedAction } from './actions'

interface PageProps {
  searchParams: Promise<{
    action?: string
    needId?: string
    error?: string
    success?: string
  }>
}

export default async function NecesidadesPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session || !session.user) {
    redirect('/login')
  }

  const orgId = session.user.organizationId
  if (!orgId) {
    redirect('/onboarding')
  }

  const params = await searchParams
  const action = params.action
  const editNeedId = params.needId
  const success = params.success
  const error = params.error

  const errorMessages: Record<string, string> = {
    invalid: 'Datos inválidos o faltantes. Por favor, revisá los campos.',
    unauthorized: 'No tenés permisos para realizar esta acción.',
    unknown: 'Algo salió mal. Por favor, intenta de nuevo.'
  }

  const successMessages: Record<string, string> = {
    created: '¡Necesidad publicada con éxito!',
    updated: '¡Necesidad actualizada con éxito!',
    deleted: 'Necesidad eliminada de tu panel.'
  }

  const errorMessage = error ? errorMessages[error] || errorMessages.unknown : null
  const successMessage = success ? successMessages[success] : null

  const populationsList = await db.select().from(populations).orderBy(asc(populations.name))

  let editItem: typeof needs.$inferSelect | null = null
  if (action === 'edit' && editNeedId) {
    const [fetchedNeed] = await db
      .select()
      .from(needs)
      .where(and(eq(needs.id, editNeedId), eq(needs.reportedByOrgId, orgId)))
    
    if (fetchedNeed) {
      editItem = fetchedNeed
    } else {
      redirect('/app/necesidades?error=unauthorized')
    }
  }

  if (action === 'new' || (action === 'edit' && editItem)) {
    return (
      <div className="container py-8 px-4 max-w-4xl mx-auto">
        <NeedForm item={editItem} populationsList={populationsList} />
      </div>
    )
  }

  const items = await db
    .select({
      need: needs,
      population: populations
    })
    .from(needs)
    .leftJoin(populations, eq(needs.populationId, populations.id))
    .where(eq(needs.reportedByOrgId, orgId))
    .orderBy(desc(needs.updatedAt))

  return (
    <div className="container py-8 px-4 max-w-5xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Necesidades Reportadas</h1>
          <p className="text-muted-foreground mt-1">
            Gestioná y actualizá los requerimientos urgentes que tu fundación publicó.
          </p>
        </div>
        <Link href="/app/necesidades?action=new" passHref>
          <Button size="lg" className="h-12 text-base font-semibold w-full sm:w-auto px-6">
            Reportar necesidad
          </Button>
        </Link>
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
          <p className="text-lg font-semibold text-muted-foreground">No has reportado necesidades</p>
          <p className="text-sm text-muted-foreground mt-1">
            Compartí los requerimientos críticos de las comunidades que atendés.
          </p>
          <Link href="/app/necesidades?action=new" passHref className="mt-4 block">
            <Button variant="outline">Comenzar a reportar</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Vista Móvil (Cards) */}
          <div className="block md:hidden space-y-4">
            {items.map(({ need, population }) => (
              <div key={need.id} className="border rounded-xl p-4 bg-card space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-foreground capitalize">{need.category.replace('_', ' ')}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{population?.name} ({population?.city})</p>
                  </div>
                  <StatusSelect needId={need.id} currentStatus={need.status as 'abierta' | 'parcial' | 'cubierta'} />
                </div>
                
                <div className="space-y-1.5 text-sm pt-1">
                  <div>
                    <p className="text-muted-foreground text-xs">Descripción</p>
                    <p className="font-medium text-foreground line-clamp-2">{need.description}</p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-muted-foreground text-xs">Cantidad</p>
                      <p className="font-semibold text-foreground">
                        {need.quantityNeeded} {need.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Urgencia</p>
                      <p className="font-semibold text-foreground capitalize">{need.urgency}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t text-sm">
                  <Link href={`/app/necesidades?action=edit&needId=${need.id}`} passHref>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </Link>
                  <form action={deleteNeedAction}>
                    <input type="hidden" name="needId" value={need.id} />
                    <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
                      Eliminar
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>

          {/* Vista Escritorio (Tabla) */}
          <div className="hidden md:block border rounded-xl overflow-hidden bg-card">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b text-sm font-semibold text-muted-foreground">
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Población</th>
                  <th className="p-4">Cantidad</th>
                  <th className="p-4">Urgencia</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y">
                {items.map(({ need, population }) => (
                  <tr key={need.id} className="hover:bg-muted/10 transition">
                    <td className="p-4 font-semibold text-foreground capitalize">
                      {need.category.replace('_', ' ')}
                      <p className="text-xs text-muted-foreground font-normal line-clamp-1 mt-1">{need.description}</p>
                    </td>
                    <td className="p-4 text-muted-foreground font-medium">
                      {population?.name} <br/>
                      <span className="text-xs font-normal">{population?.city}, {population?.department}</span>
                    </td>
                    <td className="p-4 font-medium">
                      {need.quantityNeeded} {need.unit}
                    </td>
                    <td className="p-4 text-muted-foreground capitalize">
                      {need.urgency}
                    </td>
                    <td className="p-4">
                      <StatusSelect needId={need.id} currentStatus={need.status as 'abierta' | 'parcial' | 'cubierta'} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Link href={`/app/necesidades?action=edit&needId=${need.id}`} passHref>
                          <Button variant="outline" size="sm">
                            Editar
                          </Button>
                        </Link>
                        <form action={deleteNeedAction}>
                          <input type="hidden" name="needId" value={need.id} />
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
