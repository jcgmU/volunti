import { auth } from '@/auth'
import { db } from '@/db'
import { inventory } from '@/db/schema'
import { and, eq, desc } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StatusSelect } from './components/status-select'
import { InventoryForm } from './components/inventory-form'
import { deleteInventoryItemAction } from './actions'

interface PageProps {
  searchParams: Promise<{
    action?: string
    itemId?: string
    error?: string
    success?: string
  }>
}

export default async function InventarioPage({ searchParams }: PageProps) {
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
  const editItemId = params.itemId
  const success = params.success
  const error = params.error

  const errorMessages: Record<string, string> = {
    invalid: 'Datos inválidos o faltantes. Por favor, revisá los campos.',
    unauthorized: 'No tenés permisos para realizar esta acción.',
    unknown: 'Algo salió mal. Por favor, intenta de nuevo.'
  }

  const successMessages: Record<string, string> = {
    created: '¡Artículo registrado con éxito!',
    updated: '¡Artículo actualizado con éxito!',
    deleted: 'Artículo eliminado de tu inventario.'
  }

  const errorMessage = error ? errorMessages[error] || errorMessages.unknown : null
  const successMessage = success ? successMessages[success] : null

  let editItem: typeof inventory.$inferSelect | null = null
  if (action === 'edit' && editItemId) {
    const [fetchedItem] = await db
      .select()
      .from(inventory)
      .where(and(eq(inventory.id, editItemId), eq(inventory.organizationId, orgId)))
    
    if (fetchedItem) {
      editItem = fetchedItem
    } else {
      redirect('/app/inventario?error=unauthorized')
    }
  }

  if (action === 'new' || (action === 'edit' && editItem)) {
    return (
      <div className="container py-8 px-4 max-w-4xl mx-auto">
        <InventoryForm item={editItem} />
      </div>
    )
  }

  const items = await db
    .select()
    .from(inventory)
    .where(eq(inventory.organizationId, orgId))
    .orderBy(desc(inventory.updatedAt))

  const categoryLabels: Record<string, string> = {
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

  return (
    <div className="container py-8 px-4 max-w-5xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi Inventario</h1>
          <p className="text-muted-foreground mt-1">
            Administrá los recursos y suministros disponibles de tu fundación.
          </p>
        </div>
        <Link href="/app/inventario?action=new" passHref>
          <Button size="lg" className="h-12 text-base font-semibold w-full sm:w-auto px-6">
            Registrar artículo
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
          <p className="text-lg font-semibold text-muted-foreground">No hay artículos registrados</p>
          <p className="text-sm text-muted-foreground mt-1">
            Registrá tus suministros para que puedan ser coordinados en emergencias.
          </p>
          <Link href="/app/inventario?action=new" passHref className="mt-4 block">
            <Button variant="outline">Comenzar a registrar</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="block md:hidden space-y-4">
            {items.map((item) => (
              <div key={item.id} className="border rounded-xl p-4 bg-card space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {categoryLabels[item.category] || item.category}
                    </span>
                    <h3 className="text-lg font-bold mt-1 text-foreground">{item.itemName}</h3>
                  </div>
                  <StatusSelect itemId={item.id} currentStatus={item.status as 'disponible' | 'reservado' | 'entregado'} />
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm pt-1">
                  <div>
                    <p className="text-muted-foreground text-xs">Cantidad</p>
                    <p className="font-semibold text-foreground">{item.quantity} {item.unit}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Ubicación</p>
                    <p className="font-semibold text-foreground">{item.location}</p>
                  </div>
                </div>

                {item.notes && (
                  <div className="text-xs bg-muted/30 p-2.5 rounded-lg text-muted-foreground">
                    <p className="font-medium text-foreground mb-0.5">Notas:</p>
                    <p>{item.notes}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t text-sm">
                  <Link href={`/app/inventario?action=edit&itemId=${item.id}`} passHref>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </Link>
                  <form action={deleteInventoryItemAction}>
                    <input type="hidden" name="itemId" value={item.id} />
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
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Artículo</th>
                  <th className="p-4">Cantidad</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Ubicación</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/10 transition">
                    <td className="p-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-muted text-muted-foreground">
                        {categoryLabels[item.category] || item.category}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-foreground">
                      <div>
                        <p>{item.itemName}</p>
                        {item.notes && <p className="text-xs font-normal text-muted-foreground mt-0.5">{item.notes}</p>}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-foreground">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="p-4">
                      <StatusSelect itemId={item.id} currentStatus={item.status as 'disponible' | 'reservado' | 'entregado'} />
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {item.location}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Link href={`/app/inventario?action=edit&itemId=${item.id}`} passHref>
                          <Button variant="outline" size="sm">
                            Editar
                          </Button>
                        </Link>
                        <form action={deleteInventoryItemAction}>
                          <input type="hidden" name="itemId" value={item.id} />
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
