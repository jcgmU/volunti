import { auth, signOut } from '@/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: Promise<{ onboarded?: string }>
}

export default async function AppPage({ searchParams }: PageProps) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const params = await searchParams
  const showOnboardedSuccess = params.onboarded === '1'
  const showOnboardingBanner = session.user.organizationId === null

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-4 text-center">
      <div className="max-w-md w-full flex flex-col items-center">
        
        {/* Banner de éxito de Onboarding */}
        {showOnboardedSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg p-4 text-sm w-full mb-6 text-left font-medium">
            ¡Perfil creado! Te damos la bienvenida a Volunti.
          </div>
        )}

        {/* Banner de Recordatorio de Onboarding no bloqueante */}
        {showOnboardingBanner && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-4 text-sm w-full mb-6 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold">Perfil incompleto</p>
              <p className="text-amber-800 text-xs mt-0.5">Todavía no completaste el perfil de tu fundación.</p>
            </div>
            <Link href="/onboarding" passHref className="shrink-0">
              <Button size="sm" variant="outline" className="border-amber-300 text-amber-950 hover:bg-amber-100 h-9 px-3">
                Completar ahora
              </Button>
            </Link>
          </div>
        )}

        <div className="space-y-6 w-full mt-2">
          <h1 className="text-3xl font-bold">¡Hola, {session.user.name}!</h1>
          <p className="text-muted-foreground">
            Te has autenticado con éxito en Volunti.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <Link href="/app/inventario" passHref className="block text-left border rounded-xl p-5 hover:bg-muted/30 transition">
              <h2 className="font-bold text-lg text-foreground">📦 Mi Inventario</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Registrá, actualizá y consultá los recursos y suministros disponibles de tu fundación.
              </p>
            </Link>
            <Link href="/app/voluntarios" passHref className="block text-left border rounded-xl p-5 hover:bg-muted/30 transition">
              <h2 className="font-bold text-lg text-foreground">🙋 Mis Voluntarios</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Gestioná las personas dispuestas a colaborar con tu organización.
              </p>
            </Link>
            <Link href="/app/necesidades" passHref className="block text-left border rounded-xl p-5 hover:bg-muted/30 transition">
              <h2 className="font-bold text-lg text-foreground">📢 Reportar Necesidad</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Compartí y gestioná los requerimientos críticos de las poblaciones que atendés.
              </p>
            </Link>
          </div>

          <div className="pt-4">
            <form
              action={async () => {
                'use server'
                await signOut({ redirectTo: '/' })
              }}
            >
              <Button type="submit" variant="destructive" size="lg" className="h-12 text-base w-full sm:w-auto px-8">
                Cerrar sesión
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
