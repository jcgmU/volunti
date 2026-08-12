import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { auth } from '@/auth';

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 text-center px-4">
      <main className="max-w-2xl space-y-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Volunti
        </h1>
        <p className="text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Plataforma de coordinación de ayuda humanitaria para conectar fundaciones, inventarios y voluntarios en tiempo real.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          {session ? (
            <Link href="/app" passHref>
              <Button size="lg" className="w-full sm:w-auto h-12 text-base font-semibold px-8">
                Ir a mi panel
              </Button>
            </Link>
          ) : (
            <Link href="/registro" passHref>
              <Button size="lg" className="w-full sm:w-auto h-12 text-base font-semibold px-8">
                Registrarme
              </Button>
            </Link>
          )}
          {/* El enlace a /panorama se deja funcional como redirección. Actualmente no existe y devolverá 404, como está planeado para esta fase */}
          <Link href="/panorama" passHref>
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 text-base px-8">
              Ver panorama actual
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
