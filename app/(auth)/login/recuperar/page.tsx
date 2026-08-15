'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { requestPasswordResetAction } from '../../actions';
import { Turnstile } from '@marsidev/react-turnstile';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function RecuperarPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);

    const result = await requestPasswordResetAction(formData);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Si el correo existe, te enviamos un link para restablecer tu contraseña.' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Algo salió mal.' });
    }
    
    setLoading(false);
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-none shadow-none sm:border sm:shadow-sm">
        <CardHeader className="space-y-1 text-center sm:text-left">
          <CardTitle className="text-2xl font-bold tracking-tight">Recuperar contraseña</CardTitle>
          <CardDescription>
            Ingresa tu correo y te enviaremos un link para restablecerla.
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

          {!message || message.type === 'error' ? (
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" name="email" type="email" placeholder="nombre@correo.com" required className="h-12" />
              </div>

              {turnstileSiteKey && (
                <div className="flex justify-center my-4">
                  <Turnstile siteKey={turnstileSiteKey} />
                </div>
              )}

              <Button type="submit" className="w-full h-12 text-base font-semibold" size="lg" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar link de recuperación
              </Button>
            </form>
          ) : null}
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Volver a iniciar sesión
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
