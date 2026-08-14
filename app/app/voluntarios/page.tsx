import { auth } from '@/auth'
import { db } from '@/db'
import { volunteers } from '@/db/schema'
import { and, eq, asc } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StatusSelect } from './components/status-select'
import { VolunteerForm } from './components/volunteer-form'
import { deleteVolunteerAction } from './actions'

interface PageProps {
  searchParams: Promise<{
    action?: string
    volunteerId?: string
    error?: string
    success?: string
  }>
}

export default async function VoluntariosPage({ searchParams }: PageProps) {
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
  const editVolunteerId = params.volunteerId
  const success = params.success
  const error = params.error

  const errorMessages: Record<string, string> = {
    invalid: 'Datos inválidos o faltantes. Por favor, revisa los campos.',
    unauthorized: 'No tienes permisos para realizar esta acción.',
    unknown: 'Algo salió mal. Por favor, intenta de nuevo.'
  }

  const successMessages: Record<string, string> = {
    created: '¡Voluntario registrado con éxito!',
    updated: '¡Voluntario actualizado con éxito!',
    deleted: 'Voluntario eliminado de tu organización.'
  }

  const errorMessage = error ? errorMessages[error] || errorMessages.unknown : null
  const successMessage = success ? successMessages[success] : null

  let editItem: typeof volunteers.$inferSelect | null = null
  if (action === 'edit' && editVolunteerId) {
    const [fetchedVolunteer] = await db
      .select()
      .from(volunteers)
      .where(and(eq(volunteers.id, editVolunteerId), eq(volunteers.organizationId, orgId)))
    
    if (fetchedVolunteer) {
      editItem = fetchedVolunteer
    } else {
      redirect('/app/voluntarios?error=unauthorized')
    }
  }

  if (action === 'new' || (action === 'edit' && editItem)) {
    return (
      <div className="container py-8 px-4 max-w-4xl mx-auto">
        <VolunteerForm item={editItem} />
      </div>
    )
  }

  const items = await db
    .select()
    .from(volunteers)
    .where(eq(volunteers.organizationId, orgId))
    .orderBy(asc(volunteers.name))

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="container py-8 px-4 max-w-5xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Voluntarios</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona las personas dispuestas a colaborar con tu organización.
          </p>
        </div>
        <Link href="/app/voluntarios?action=new" passHref>
          <Button size="lg" className="h-12 text-base font-semibold w-full sm:w-auto px-6">
            Registrar voluntario
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
          <p className="text-lg font-semibold text-muted-foreground">No hay voluntarios registrados</p>
          <p className="text-sm text-muted-foreground mt-1">
            Agrega personas de contacto para coordinar rescates, entregas y logística.
          </p>
          <Link href="/app/voluntarios?action=new" passHref className="mt-4 block">
            <Button variant="outline">Comenzar a registrar</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Vista Móvil (Cards) */}
          <div className="block md:hidden space-y-4">
            {items.map((item) => (
              <div key={item.id} className="border rounded-xl p-4 bg-card space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{item.contactPhone}</p>
                  </div>
                  <StatusSelect volunteerId={item.id} currentStatus={item.status as 'disponible' | 'asignado' | 'no_disponible'} />
                </div>
                
                <div className="space-y-1.5 text-sm pt-1">
                  <div>
                    <p className="text-muted-foreground text-xs">Ubicación</p>
                    <p className="font-semibold text-foreground">{item.city}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Disponibilidad</p>
                    <p className="font-semibold text-foreground">
                      {formatDate(item.availabilityFrom)} al {formatDate(item.availabilityTo)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Habilidades</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.skills.map((skill, idx) => (
                        <span key={idx} className="text-[11px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t text-sm">
                  <Link href={`/app/voluntarios?action=edit&volunteerId=${item.id}`} passHref>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </Link>
                  <form action={deleteVolunteerAction}>
                    <input type="hidden" name="volunteerId" value={item.id} />
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
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Contacto</th>
                  <th className="p-4">Habilidades</th>
                  <th className="p-4">Ciudad</th>
                  <th className="p-4">Disponibilidad</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/10 transition">
                    <td className="p-4 font-semibold text-foreground">
                      {item.name}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {item.contactPhone}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {item.skills.map((skill, idx) => (
                          <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {item.city}
                    </td>
                    <td className="p-4 text-muted-foreground font-medium">
                      {formatDate(item.availabilityFrom)} - {formatDate(item.availabilityTo)}
                    </td>
                    <td className="p-4">
                      <StatusSelect volunteerId={item.id} currentStatus={item.status as 'disponible' | 'asignado' | 'no_disponible'} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Link href={`/app/voluntarios?action=edit&volunteerId=${item.id}`} passHref>
                          <Button variant="outline" size="sm">
                            Editar
                          </Button>
                        </Link>
                        <form action={deleteVolunteerAction}>
                          <input type="hidden" name="volunteerId" value={item.id} />
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
