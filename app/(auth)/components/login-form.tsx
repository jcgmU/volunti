'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { loginAction, signInWithGoogle } from '../actions';

interface LoginFormProps {
  error?: string;
}

export function LoginForm({ error }: LoginFormProps) {
  const errorMessages: Record<string, string> = {
    invalid: 'Credenciales inválidas. Por favor, revisá tu correo y contraseña.',
    unknown: 'Algo salió mal. Por favor, intenta de nuevo.',
  };

  const errorMessage = error ? errorMessages[error] || errorMessages.unknown : null;

  return (
    <Card className="w-full border-none shadow-none sm:border sm:shadow-sm">
      <CardHeader className="space-y-1 text-center sm:text-left">
        <CardTitle className="text-2xl font-bold tracking-tight">Iniciar sesión</CardTitle>
        <CardDescription>
          Ingresá tus credenciales para acceder a tu panel de Volunti.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorMessage && (
          <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive font-medium">
            {errorMessage}
          </div>
        )}

        <form action={signInWithGoogle}>
          <Button type="submit" variant="outline" className="w-full h-12 text-base" size="lg">
            <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
            Continuar con Google
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground font-medium">o</span>
          </div>
        </div>

        <form action={loginAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" name="email" type="email" placeholder="nombre@correo.com" required className="h-12" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" required className="h-12" />
          </div>
          <Button type="submit" className="w-full h-12 text-base font-semibold mt-2" size="lg">
            Iniciar sesión
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm">
        <span className="text-muted-foreground mr-1">¿No tenés cuenta?</span>
        <Link href="/registro" className="font-semibold text-primary hover:underline">
          Registrate
        </Link>
      </CardFooter>
    </Card>
  );
}
