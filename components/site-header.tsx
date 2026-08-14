import Link from 'next/link'
import { auth } from '@/auth'
import { Button } from '@/components/ui/button'

interface SiteHeaderProps {
  active?: 'panorama' | 'ofertas'
}

export async function SiteHeader({ active }: SiteHeaderProps) {
  const session = await auth()

  return (
    <header className="border-b bg-background sticky top-0 z-30">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-heading font-bold text-xl tracking-tight">Volunti</Link>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link 
            href="/panorama" 
            className={`${active === 'panorama' ? 'text-primary' : 'text-muted-foreground hover:text-foreground transition-colors'}`}
          >
            Panorama
          </Link>
          <Link 
            href="/ofertas" 
            className={`${active === 'ofertas' ? 'text-primary' : 'text-muted-foreground hover:text-foreground transition-colors'}`}
          >
            Ofertas de Ayuda
          </Link>
          {session ? (
            <Link href="/app" passHref>
              <Button variant="outline" size="sm">Ir a mi panel</Button>
            </Link>
          ) : (
            <Link href="/login" passHref>
              <Button variant="ghost" size="sm">Iniciar sesión</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
