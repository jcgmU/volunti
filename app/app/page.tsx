import { auth, signOut } from '@/auth';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';

export default async function AppPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] py-12 px-4 text-center">
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-3xl font-bold">¡Hola, {session.user.name}!</h1>
        <p className="text-muted-foreground">
          Te has autenticado con éxito en Volunti. Tu panel de control principal estará disponible pronto.
        </p>
        <div className="pt-4">
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/' });
            }}
          >
            <Button type="submit" variant="destructive" size="lg" className="h-12 text-base w-full sm:w-auto px-8">
              Cerrar sesión
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
