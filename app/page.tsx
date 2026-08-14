import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { auth } from '@/auth'
import { SiteHeader } from '@/components/site-header'
import { HeartPulse, Building2, HeartHandshake, Check, ShieldCheck, Lock, Gauge, Flag } from 'lucide-react'
import { db } from '@/db'
import { organizations, needs, p2pOffers } from '@/db/schema'
import { count, eq } from 'drizzle-orm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Volunti — Coordinación de ayuda humanitaria',
  description: 'Plataforma de coordinación de ayuda humanitaria: conecta fundaciones, voluntarios y personas en emergencias.',
}

export default async function Home() {
  const session = await auth()

  const [orgCount] = await db.select({ value: count() }).from(organizations)
  const [needCount] = await db.select({ value: count() }).from(needs).where(eq(needs.status, 'abierta'))
  const [offerCount] = await db.select({ value: count() }).from(p2pOffers).where(eq(p2pOffers.status, 'activa'))

  return (
    <>
      <SiteHeader />
      <main className="w-full">
        {/* Hero */}
        <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300 mb-6">
            <HeartPulse className="h-4 w-4" />
            <span>Coordinación de ayuda humanitaria · Colombia</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            Cuando la ayuda se coordina, llega más rápido
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Plataforma que conecta fundaciones, voluntarios y personas durante emergencias, con datos públicos en tiempo real.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {session ? (
              <Link href="/app" passHref className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-12 px-8 text-base">Ir a mi panel</Button>
              </Link>
            ) : (
              <>
                <Link href="/registro" passHref className="w-full sm:w-auto">
                  <Button size="lg" className="w-full h-12 px-8 text-base">Registrar mi fundación</Button>
                </Link>
                <Link href="/elegir-rol" passHref className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full h-12 px-8 text-base">Quiero donar o pedir ayuda</Button>
                </Link>
              </>
            )}
          </div>
          <div className="mt-8">
            <Link href="/panorama" className="text-sm font-medium text-primary hover:underline">
              Ver el panorama en tiempo real →
            </Link>
          </div>
        </section>

        {/* Stats en vivo */}
        <section className="border-y bg-muted/30 py-10 w-full">
          <div className="mx-auto w-full max-w-6xl px-4">
            <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8">
              Datos en tiempo real de la plataforma
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-3xl sm:text-4xl font-extrabold tabular-nums text-foreground">{orgCount.value}</p>
                <p className="text-sm text-muted-foreground mt-2">Organizaciones registradas</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-extrabold tabular-nums text-foreground">{needCount.value}</p>
                <p className="text-sm text-muted-foreground mt-2">Necesidades abiertas</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-extrabold tabular-nums text-foreground">{offerCount.value}</p>
                <p className="text-sm text-muted-foreground mt-2">Ofertas de ayuda activas</p>
              </div>
            </div>
            <div className="mt-8 text-center">
              <Link href="/panorama" className="text-sm font-medium text-primary hover:underline">
                Explorar el panorama completo →
              </Link>
            </div>
          </div>
        </section>

        {/* Dos caminos */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight">Dos formas de ser parte</h2>
            <p className="text-lg text-muted-foreground mt-3">Elige cómo quieres ayudar o recibir ayuda</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Card A */}
            <div className="border rounded-2xl p-6 sm:p-8 bg-card hover:shadow-md transition-shadow flex flex-col">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center justify-center mb-6">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Fundaciones y organizaciones</h3>
              <p className="text-muted-foreground mb-6 flex-1">
                Para ONGs, fundaciones, empresas y colectivos que coordinan ayuda humanitaria.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm">Gestiona inventario y voluntarios en un solo lugar.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm">Publica necesidades urgentes geolocalizadas.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm">Aparece en el dashboard público para que todos vean qué hace falta.</span>
                </li>
              </ul>
              <Link href="/registro" passHref className="mt-auto">
                <Button className="w-full">Registrar mi fundación</Button>
              </Link>
            </div>

            {/* Card B */}
            <div className="border rounded-2xl p-6 sm:p-8 bg-card hover:shadow-md transition-shadow flex flex-col">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center justify-center mb-6">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Personas</h3>
              <p className="text-muted-foreground mb-6 flex-1">
                Para individuos y grupos independientes que quieren donar o pedir ayuda directamente.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm">Publica ofertas de donación con foto.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm">Explora ofertas por ciudad y categoría.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm">Solicita la ayuda que necesitas y coordina por WhatsApp directamente.</span>
                </li>
              </ul>
              <div className="mt-auto flex flex-col gap-3">
                <Link href="/elegir-rol" passHref>
                  <Button className="w-full">Quiero donar o pedir ayuda</Button>
                </Link>
                <Link href="/ofertas" className="text-sm font-medium text-primary hover:underline text-center">
                  Explorar ofertas activas →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="bg-muted/30 border-y py-16 sm:py-20 w-full">
          <div className="mx-auto w-full max-w-6xl px-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-center mb-12">Cómo funciona</h2>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <h3 className="text-xl font-bold border-b pb-2">Para organizaciones</h3>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-foreground">Registra tu cuenta</h4>
                    <p className="text-sm text-muted-foreground mt-1">Conecta con Google o tu correo electrónico.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-foreground">Completa tu perfil</h4>
                    <p className="text-sm text-muted-foreground mt-1">Añade los detalles de tu organización y causa.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-foreground">Gestiona y publica</h4>
                    <p className="text-sm text-muted-foreground mt-1">Administra inventario y voluntarios, y publica necesidades visibles para todos.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="text-xl font-bold border-b pb-2">Para personas</h3>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-foreground">Crea tu cuenta</h4>
                    <p className="text-sm text-muted-foreground mt-1">Regístrate y configura tu perfil solidario.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-foreground">Ofrece o solicita</h4>
                    <p className="text-sm text-muted-foreground mt-1">Publica una oferta de ayuda o explora las ofertas y solicita la que necesitas.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-foreground">Coordina directo</h4>
                    <p className="text-sm text-muted-foreground mt-1">Si el donante acepta tu solicitud, recibes su WhatsApp para coordinar.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Confianza y seguridad */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight">Confianza y seguridad</h2>
            <p className="text-lg text-muted-foreground mt-3">Herramientas para coordinar de forma segura</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="space-y-3">
              <ShieldCheck className="w-8 h-8 text-primary" />
              <h4 className="font-bold">Propiedad verificada</h4>
              <p className="text-sm text-muted-foreground">Cada acción sobre los datos verifica tu identidad en el servidor.</p>
            </div>
            <div className="space-y-3">
              <Lock className="w-8 h-8 text-primary" />
              <h4 className="font-bold">Contacto protegido</h4>
              <p className="text-sm text-muted-foreground">El teléfono del donante solo se revela al aceptar la solicitud.</p>
            </div>
            <div className="space-y-3">
              <Gauge className="w-8 h-8 text-primary" />
              <h4 className="font-bold">Límite de solicitudes</h4>
              <p className="text-sm text-muted-foreground">Máximo 5 solicitudes por día por persona para evitar abuso.</p>
            </div>
            <div className="space-y-3">
              <Flag className="w-8 h-8 text-primary" />
              <h4 className="font-bold">Reportes</h4>
              <p className="text-sm text-muted-foreground">Cualquier usuario puede reportar. 3 denuncias bloquean el perfil automáticamente.</p>
            </div>
          </div>
          
          <div className="border rounded-xl bg-muted/40 p-5 sm:p-6 text-sm text-muted-foreground text-center">
            <p className="font-bold text-foreground mb-2">Aviso importante</p>
            <p>
              Volunti facilita el contacto entre personas, pero no verifica la identidad, la necesidad real ni la entrega de las donaciones. Cada persona es responsable de confirmar por su cuenta antes de coordinar una entrega. Usa el sentido común: prefiere lugares públicos y no compartas datos sensibles innecesarios.
            </p>
          </div>
        </section>

        {/* CTA final */}
        <section className="bg-primary text-primary-foreground py-16 w-full text-center px-4">
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">¿Listo para ayudar?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Súmate a la red de coordinación humanitaria y haz que tu ayuda llegue más rápido.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <Link href="/app" passHref className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full h-12 px-8 font-semibold">Ir a mi panel</Button>
              </Link>
            ) : (
              <>
                <Link href="/registro" passHref className="w-full sm:w-auto">
                  <Button size="lg" variant="secondary" className="w-full h-12 px-8 font-semibold">Registrar mi fundación</Button>
                </Link>
                <Link href="/elegir-rol" passHref className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full h-12 px-8 bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10">Quiero donar o pedir ayuda</Button>
                </Link>
              </>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t py-8 mt-auto">
        <div className="mx-auto w-full max-w-6xl px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>Volunti — Plataforma de coordinación de ayuda humanitaria</p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/panorama" className="hover:text-foreground transition-colors">Panorama</Link>
            <Link href="/ofertas" className="hover:text-foreground transition-colors">Ofertas</Link>
            {!session && (
              <>
                <Link href="/login" className="hover:text-foreground transition-colors">Iniciar sesión</Link>
                <Link href="/registro" className="hover:text-foreground transition-colors">Registro</Link>
              </>
            )}
          </div>
        </div>
      </footer>
    </>
  )
}
