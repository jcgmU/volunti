'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { resendVerificationEmailAction } from '@/app/verificar-email/actions';

export function EmailVerificationBanner() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleResend() {
    setLoading(true);
    setMessage(null);

    const result = await resendVerificationEmailAction();
    if (result.success) {
      setMessage('Te enviamos un nuevo link de verificación. Revisá tu bandeja de entrada.');
    } else {
      setMessage(result.error || 'No se pudo reenviar el email.');
    }

    setLoading(false);
  }

  return (
    <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-4 text-sm w-full mb-6 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <p className="font-semibold">Verificá tu correo electrónico para mayor seguridad.</p>
        {message && <p className="text-amber-800 text-xs mt-1">{message}</p>}
      </div>
      <Button
        onClick={handleResend}
        disabled={loading}
        size="sm"
        variant="outline"
        className="border-amber-300 text-amber-950 hover:bg-amber-100 h-9 px-3 shrink-0"
      >
        {loading ? 'Enviando...' : 'Reenviar email'}
      </Button>
    </div>
  );
}
