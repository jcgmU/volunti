import Link from 'next/link'
import { auth } from '@/auth'
import { DeviaCredit } from './devia-credit'

export async function SiteFooter() {
  const session = await auth()

  return (
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
          <a href="mailto:jcgm1047@gmail.com?subject=Soporte%20Volunti" className="hover:text-foreground transition-colors">Soporte</a>
          <Link href="/privacidad" className="hover:text-foreground transition-colors">Privacidad</Link>
          <Link href="/terminos" className="hover:text-foreground transition-colors">Términos</Link>
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl px-4 mt-4 pt-4 border-t">
        <DeviaCredit />
      </div>
    </footer>
  )
}
