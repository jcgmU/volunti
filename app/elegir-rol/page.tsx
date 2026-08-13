import Link from 'next/link'
import { Building2, HeartHandshake } from 'lucide-react'

export default function ElegirRolPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-2xl text-center space-y-8">
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Bienvenido a Volunti</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Para personalizar tu experiencia, contanos cómo vas a usar la plataforma.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <Link href="/onboarding" className="group relative border-2 border-muted hover:border-primary rounded-2xl p-6 transition-all hover:shadow-md bg-card flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-primary">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Soy una fundación</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Quiero registrar a mi organización para gestionar inventario, necesidades y voluntarios en terreno.
              </p>
            </div>
          </Link>

          <Link href="/onboarding/p2p" className="group relative border-2 border-muted hover:border-primary rounded-2xl p-6 transition-all hover:shadow-md bg-card flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-primary">
              <HeartHandshake className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Soy voluntario / particular</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Quiero donar recursos (dinero, alimentos, tiempo) o registrar una solicitud directa de ayuda.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
