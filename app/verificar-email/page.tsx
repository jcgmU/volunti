import { verifyEmailAction } from './actions';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResendButton } from './resend-button';

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerificarEmailPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token;

  let result: { success: boolean; error?: string } | null = null;
  if (token) {
    result = await verifyEmailAction(token);
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-none shadow-none sm:border sm:shadow-sm">
        <CardHeader className="space-y-1 text-center sm:text-left">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {result?.success ? 'Correo verificado' : 'Verificación de correo'}
          </CardTitle>
          <CardDescription>
            {result?.success
              ? 'Tu correo electrónico fue verificado con éxito.'
              : 'Verificá el estado de tu correo electrónico.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result?.success ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-900 font-medium">
                ¡Listo! Tu cuenta ahora tiene mayor seguridad.
              </div>
              <Link href="/app" passHref>
                <Button className="w-full h-12 text-base font-semibold" size="lg">
                  Ir al panel
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {result?.error && (
                <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive font-medium">
                  {result.error}
                </div>
              )}
              {!token && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900 font-medium">
                  No se proporcionó un token de verificación.
                </div>
              )}
              <ResendButton />
              <Link href="/app" passHref>
                <Button variant="outline" className="w-full h-12 text-base" size="lg">
                  Volver al panel
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
