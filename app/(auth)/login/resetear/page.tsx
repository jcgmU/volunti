'use client';

import { useState, use } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { resetPasswordAction } from '../../actions';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default function ResetearPasswordPage({ searchParams }: PageProps) {
  const { token } = use(searchParams);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password.length < 8) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 8 caracteres.' });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }

    if (!token) {
      setMessage({ type: 'error', text: 'Token inválido o expirado. Por favor, solicita uno nuevo.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const result = await resetPasswordAction(token, password);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Contraseña actualizada. Inicia sesión.' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Algo salió mal.' });
    }
    
    setLoading(false);
  }

  if (!token) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md border-none shadow-none sm:border sm:shadow-sm">
          <CardHeader className="space-y-1 text-center sm:text-left">
            <CardTitle className="text-2xl font-bold tracking-tight">Error</CardTitle>
            <CardDescription>
              Link inválido o expirado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login/recuperar" passHref>
              <Button className="w-full h-12 text-base font-semibold" size="lg">
                Solicitar nuevo link
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-none shadow-none sm:border sm:shadow-sm">
        <CardHeader className="space-y-1 text-center sm:text-left">
          <CardTitle className="text-2xl font-bold tracking-tight">Crear nueva contraseña</CardTitle>
          <CardDescription>
            Ingresa tu nueva contraseña para tu cuenta de Volunti.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <div className={`rounded-lg p-3 text-sm font-medium ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-destructive/15 text-destructive'
            }`}>
              {message.text}
            </div>
          )}

          {message?.type === 'success' ? (
            <Link href="/login" passHref>
              <Button className="w-full h-12 text-base font-semibold" size="lg">
                Iniciar sesión
              </Button>
            </Link>
          ) : (
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nueva contraseña</Label>
                <Input id="password" name="password" type="password" required className="h-12" minLength={8} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" required className="h-12" minLength={8} />
              </div>

              <Button type="submit" className="w-full h-12 text-base font-semibold mt-4" size="lg" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Actualizar contraseña
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
