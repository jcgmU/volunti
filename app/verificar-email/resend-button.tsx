'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { resendVerificationEmailAction } from './actions';

export function ResendButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleResend() {
    setLoading(true);
    setMessage(null);
    setError(null);

    const result = await resendVerificationEmailAction();
    if (result.success) {
      setMessage('Te enviamos un nuevo link de verificación. Revisá tu bandeja de entrada.');
    } else {
      setError(result.error || 'No se pudo reenviar el email.');
    }

    setLoading(false);
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleResend}
        disabled={loading}
        variant="outline"
        className="w-full h-12 text-base font-semibold"
        size="lg"
      >
        {loading ? 'Enviando...' : 'Reenviar email de verificación'}
      </Button>
      {message && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-900 font-medium">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive font-medium">
          {error}
        </div>
      )}
    </div>
  );
}
